import { NotificationUtils } from "./NotificationUtils.js";
import { NotificationUI } from "./NotificationUI.js";
import { UserConfig } from "../sdk/userConfig.js";
import { CacheTTLs } from "../utils/cacheConfig.js";

const userConfig = new UserConfig();
// Cache class IDs per user to avoid duplicate network calls across instances
const classIdsCache = new Map(); // key: `${userConfig.userType}:${userConfig.userId}` -> { value: number[], promise?: Promise<number[]> }
// Cache my announcement IDs and my comment IDs to perform ownership checks
const myAnnouncementsCache = new Map(); // key: `${userConfig.userId}` -> { value: number[], promise?: Promise<number[]> }
const myCommentsCache = new Map(); // key: `${userConfig.userId}` -> { value: number[], promise?: Promise<number[]> }

export class NotificationCore {
  constructor({
    plugin,
    modelName = "AwcAlert",
    limit,
    targetElementId,
    scope,
  }) {
    this.plugin = plugin;
    // Allow passing legacy schema name or new identifier
    this.modelName = modelName;
    this.targetElementId = targetElementId;
    this.limit = limit;
    this.scope =
      scope ||
      (Number.isFinite(limit) && limit > 0 && limit <= 10 ? "nav" : "body");
    // Prefer switching by identifier; fall back to schema name
    try {
      this.alertsModel =
        typeof plugin.switchToId === "function"
          ? plugin.switchToId("ALERT")
          : plugin.switchTo(modelName);
    } catch (_) {
      this.alertsModel = plugin.switchTo(modelName);
    }
    this.query = null;
    this.subscriptions = [];
    this.lastSig = null;
  }

  async fetchClassIds() {
    // Only fetch for students/teachers; admins do not constrain by classes
    const userType = String(userConfig.userType || "").toLowerCase();
    if (userType === "admin") return [];
    const cacheKey = `${userType}:${userConfig.userId}`;
    const cached = classIdsCache.get(cacheKey);
    if (cached?.value) return cached.value;

    // Try persisted cache (speeds up navbar on fresh loads)
    try {
      const lsKey = `awc:classIds:${cacheKey}`;
      const raw = localStorage.getItem(lsKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          classIdsCache.set(cacheKey, { value: parsed });
          // Fire-and-forget background refresh to keep it fresh
          setTimeout(() => {
            this.fetchClassIdsNetwork(cacheKey).catch(() => {});
          }, 0);
          return parsed;
        }
      }
    } catch (_) {}

    if (cached?.promise) return cached.promise;

    const inFlight = this.fetchClassIdsNetwork(cacheKey, userType);

    classIdsCache.set(cacheKey, { promise: inFlight });
    try {
      const value = await inFlight;
      classIdsCache.set(cacheKey, { value });
      return value;
    } catch (e) {
      classIdsCache.delete(cacheKey);
      throw e;
    }
  }

  async fetchClassIdsNetwork(cacheKey, userType) {
    const uid = Number(userConfig.userId);
    let classIds = [];
    if (userType === "teacher") {
      // Teachers: find classes where instructor_id = user
      const classModel =
        typeof this.plugin.switchToId === "function"
          ? this.plugin.switchToId("CLASS")
          : this.plugin.switchTo("AwcClass");
      const q = classModel
        .query()
        .select(["id"])
        .where("instructor_id", uid)
        .limit(1000)
        .offset(0)
        .noDestroy();
      const payload = await q.fetchDirect().toPromise();
      const recs = Array.isArray(payload?.resp) ? payload.resp : [];
      classIds = recs.map((r) => r.id).filter(Boolean);
    } else {
      // Students: enrolments -> classes
      const enrolmentModel =
        typeof this.plugin.switchToId === "function"
          ? this.plugin.switchToId("ENROLMENT")
          : this.plugin.switchTo("AwcEnrolment");
      const q = enrolmentModel
        .query()
        .select(["id"])
        .where("student_id", uid)
        .include("Class", (q1) => q1.select(["id"]))
        .limit(1000)
        .offset(0)
        .noDestroy();
      const payload = await q.fetchDirect().toPromise();
      const recs = Array.isArray(payload?.resp) ? payload.resp : [];
      classIds = recs
        .map((r) => {
          const c = r.Class;
          if (!c) return [];
          if (Array.isArray(c)) return c.map((x) => x?.id).filter(Boolean);
          return [c.id].filter(Boolean);
        })
        .flat()
        .filter(Boolean);
    }
    const uniq = Array.from(new Set(classIds));
    try {
      localStorage.setItem(`awc:classIds:${cacheKey}`, JSON.stringify(uniq));
    } catch (_) {}
    return uniq;
  }

  async fetchMyAnnouncementIds() {
    const uid = String(userConfig.userId);
    if (!uid) return [];
    const cached = myAnnouncementsCache.get(uid);
    if (cached?.value) return cached.value;
    if (cached?.promise) return cached.promise;
    const run = async () => {
      try {
        const model = typeof this.plugin.switchTo === "function"
          ? this.plugin.switchTo("calcAnnouncements")
          : this.plugin.switchToId && this.plugin.switchToId("calcAnnouncements");
        const q = model
          .query()
          .select(["id"]) // id of announcement
          .where("instructor_id", Number(uid))
          .limit(10000)
          .offset(0)
          .noDestroy();
        const payload = await q.fetchDirect().toPromise();
        const recs = Array.isArray(payload?.resp) ? payload.resp : [];
        const ids = recs.map((r) => r.id).filter(Boolean);
        return Array.from(new Set(ids));
      } catch (_) {
        return [];
      }
    };
    const p = run();
    myAnnouncementsCache.set(uid, { promise: p });
    try {
      const v = await p;
      myAnnouncementsCache.set(uid, { value: v });
      return v;
    } catch (e) {
      myAnnouncementsCache.delete(uid);
      throw e;
    }
  }

  async fetchMyCommentIds() {
    const uid = String(userConfig.userId);
    if (!uid) return [];
    const cached = myCommentsCache.get(uid);
    if (cached?.value) return cached.value;
    if (cached?.promise) return cached.promise;
    const run = async () => {
      try {
        const model = typeof this.plugin.switchTo === "function"
          ? this.plugin.switchTo("calcForumComments")
          : this.plugin.switchToId && this.plugin.switchToId("calcForumComments");
        const q = model
          .query()
          .select(["id"]) // id of comment
          .where("author_id", Number(uid))
          .limit(10000)
          .offset(0)
          .noDestroy();
        const payload = await q.fetchDirect().toPromise();
        const recs = Array.isArray(payload?.resp) ? payload.resp : [];
        const ids = recs.map((r) => r.id).filter(Boolean);
        return Array.from(new Set(ids));
      } catch (_) {
        return [];
      }
    };
    const p = run();
    myCommentsCache.set(uid, { promise: p });
    try {
      const v = await p;
      myCommentsCache.set(uid, { value: v });
      return v;
    } catch (e) {
      myCommentsCache.delete(uid);
      throw e;
    }
  }

  buildQuery(classIds = []) {
    const q = this.alertsModel
      .query()
      .select([
        "id",
        "alert_type",
        "content",
        "created_at",
        "is_mentioned",
        "is_read",
        "notified_contact_id",
        "origin_url",
        "parent_announcement_id",
        "parent_class_id",
        "parent_comment_id",
        "parent_post_id",
        "parent_submission_id",
        "title",
        "unique_id",
      ]);
    // Try to include related Class and Course for names (best-effort)
    try {
      if (typeof q.include === "function") {
        q.include("Parent_Class", (q1) => {
          if (typeof q1.select === "function") q1.select(["id", "class_name"]);
          try {
            if (typeof q1.include === "function") {
              q1.include("Course", (q2) => {
                if (typeof q2.select === "function") q2.select(["course_name"]);
              });
            }
          } catch (_) {}
        });
      }
    } catch (_) {}
    q.offset(0).noDestroy();
    if (Number.isFinite(this.limit) && this.limit > 0) {
      q.limit(this.limit);
    }
    const uid = userConfig.userId;
    if (uid !== undefined && uid !== null) {
      q.where("notified_contact_id", Number(uid));
    }

    // Apply user preference conditions for alert types, mentions, and ownership checks
    // Use preferences as-is. Toggling handled on page.
    const p = userConfig.preferences || {};
    const yes = (v) => String(v).trim().toLowerCase() === "yes";

    // Build a grouped OR clause covering all enabled categories
    let addedAnyBranch = false;
    const addGroup = (group) => {
      const addBranch = (fn) => {
        // each branch is (A and B and C) combined via OR with other branches
        if (typeof fn === "function") {
          group.orWhere(fn);
          addedAnyBranch = true;
        }
      };

      // Base types: include mentions implicitly when base is on
      if (yes(p.posts)) {
        addBranch((sub) =>
          sub.where((qx) => {
            // alert_type in ('Post','Post Mention')
            if (typeof qx.whereIn === "function")
              return qx.whereIn("alert_type", ["Post", "Post Mention"]);
            qx.where("alert_type", "Post").orWhere(
              "alert_type",
              "Post Mention"
            );
          })
        );
      } else if (yes(p.postMentions)) {
        // Only mentions when base is off
        addBranch((sub) =>
          sub.where("alert_type", "Post Mention").andWhere("is_mentioned", true)
        );
      }

      if (yes(p.submissions)) {
        addBranch((sub) =>
          sub.where((qx) => {
            if (typeof qx.whereIn === "function")
              return qx.whereIn("alert_type", [
                "Submission",
                "Submission Mention",
              ]);
            qx.where("alert_type", "Submission").orWhere(
              "alert_type",
              "Submission Mention"
            );
          })
        );
      } else if (yes(p.submissionMentions)) {
        addBranch((sub) =>
          sub
            .where("alert_type", "Submission Mention")
            .andWhere("is_mentioned", true)
        );
      }

      if (yes(p.announcements)) {
        addBranch((sub) =>
          sub.where((qx) => {
            if (typeof qx.whereIn === "function")
              return qx.whereIn("alert_type", [
                "Announcement",
                "Announcement  Mention",
              ]);
            qx.where("alert_type", "Announcement").orWhere(
              "alert_type",
              "Announcement  Mention"
            );
          })
        );
      } else if (yes(p.announcementMentions)) {
        addBranch((sub) =>
          sub
            .where("alert_type", "Announcement  Mention")
            .andWhere("is_mentioned", true)
        );
      }

      // Comment types (all comments regardless of authorship). Base includes mentions.
      if (yes(p.postComments)) {
        addBranch((sub) =>
          sub.where((qx) => {
            if (typeof qx.whereIn === "function")
              return qx.whereIn("alert_type", [
                "Post Comment",
                "Post Comment Mention",
              ]);
            qx.where("alert_type", "Post Comment").orWhere(
              "alert_type",
              "Post Comment Mention"
            );
          })
        );
      } else if (yes(p.postCommentMentions)) {
        addBranch((sub) =>
          sub
            .where("alert_type", "Post Comment Mention")
            .andWhere("is_mentioned", true)
        );
      }

      if (yes(p.submissionComments)) {
        addBranch((sub) =>
          sub.where((qx) => {
            if (typeof qx.whereIn === "function")
              return qx.whereIn("alert_type", [
                "Submission Comment",
                "Submission Comment Mention",
              ]);
            qx.where("alert_type", "Submission Comment").orWhere(
              "alert_type",
              "Submission Comment Mention"
            );
          })
        );
      } else if (yes(p.submissionCommentMentions)) {
        addBranch((sub) =>
          sub
            .where("alert_type", "Submission Comment Mention")
            .andWhere("is_mentioned", true)
        );
      }

      if (yes(p.announcementComments)) {
        addBranch((sub) =>
          sub.where((qx) => {
            if (typeof qx.whereIn === "function")
              return qx.whereIn("alert_type", [
                "Announcement Comment",
                "Announcement Comment Mention",
              ]);
            qx.where("alert_type", "Announcement Comment").orWhere(
              "alert_type",
              "Announcement Comment Mention"
            );
          })
        );
      } else if (yes(p.announcementCommentMentions)) {
        addBranch((sub) =>
          sub
            .where("alert_type", "Announcement Comment Mention")
            .andWhere("is_mentioned", true)
        );
      }

      // Comments on my entities (authorship checks)
      if (!yes(p.postComments) && yes(p.commentsOnMyPosts)) {
        // Fallback: include post comment types when "my" is on but base is off
        addBranch((sub) => {
          if (typeof sub.whereIn === "function")
            return sub.whereIn("alert_type", [
              "Post Comment",
              "Post Comment Mention",
            ]);
          sub
            .where("alert_type", "Post Comment")
            .orWhere("alert_type", "Post Comment Mention");
        });
      }
      if (!yes(p.submissionComments) && yes(p.commentsOnMySubmissions)) {
        addBranch((sub) => {
          if (typeof sub.whereIn === "function")
            return sub.whereIn("alert_type", [
              "Submission Comment",
              "Submission Comment Mention",
            ]);
          sub
            .where("alert_type", "Submission Comment")
            .orWhere("alert_type", "Submission Comment Mention");
        });
      }
      if (!yes(p.announcementComments) && yes(p.commentsOnMyAnnouncements)) {
        // Limit to raw comment events (exclude mentions here to avoid pulling unrelated threads)
        addBranch((sub) => {
          sub.where("alert_type", "Announcement Comment");
          // Ownership constraints: comments on my announcements OR replies to my comments
          const owned = this._ownedIds || {};
          const myAnn = Array.isArray(owned.myAnnouncementIds) ? owned.myAnnouncementIds : [];
          const myCom = Array.isArray(owned.myCommentIds) ? owned.myCommentIds : [];
          sub.andWhere((qx) => {
            const addWhereIn = (builder, field, values) => {
              if (typeof builder.whereIn === "function") return builder.whereIn(field, values);
              values.forEach((v, i) => {
                if (i === 0) builder.where(field, v);
                else builder.orWhere(field, v);
              });
            };
            let applied = false;
            if (myAnn.length) {
              addWhereIn(qx, "parent_announcement_id", myAnn);
              applied = true;
            }
            if (myCom.length) {
              const add = (b) => addWhereIn(b, "parent_comment_id", myCom);
              if (applied) qx.orWhere((b) => add(b));
              else add(qx);
              applied = true;
            }
            if (!applied) {
              try { qx.where("id", -1); } catch (_) {}
            }
          });
        });
      }

      // Comment mentions are handled above with base categories; mention-only handled when base is off
    };
    q.andWhere(addGroup);
    if (!addedAnyBranch) {
      // If no preferences are enabled, force no results
      q.limit(0);
    }

    // Apply ordering: latest first (created_at desc)
    try {
      let applied = false;
      if (typeof q.orderBy === "function") {
        try {
          q.orderBy("created_at", "desc");
          applied = true;
        } catch (_) {}
        if (!applied) {
          try {
            q.orderBy([{ path: ["created_at"], type: "desc" }]);
            applied = true;
          } catch (_) {}
        }
      }
      if (!applied && typeof q.sortBy === "function") {
        try {
          q.sortBy("created_at", "desc");
          applied = true;
        } catch (_) {}
      }
      if (!applied && typeof q.order === "function") {
        try {
          q.order("created_at", "desc");
          applied = true;
        } catch (_) {}
      }
      if (!applied && typeof q.order_by === "function") {
        try {
          q.order_by("created_at", "desc");
          applied = true;
        } catch (_) {}
      }
      if (!applied && typeof q.orderByRaw === "function") {
        try {
          q.orderByRaw("created_at desc");
          applied = true;
        } catch (_) {}
      }
    } catch (_) {
      /* ignore */
    }

    // Expose debug snapshot for later logging
    this.lastQueryDebug = {
      userId: uid,
      classIds: [],
      preferences: { ...(userConfig.preferences || {}) },
      addedAnyBranch,
    };
    try {
      window.__awcLastPrefs = this.lastQueryDebug.preferences;
    } catch (_) {}
    return q;
  }

  // Cache Helpers
  // Lightweight stable hash for keys
  hashKey(str) {
    try {
      let h = 5381;
      for (let i = 0; i < str.length; i++)
        h = ((h << 5) + h) ^ str.charCodeAt(i);
      return (h >>> 0).toString(36);
    } catch (_) {
      return String(Math.abs(str.length || 0));
    }
  }

  prefsSignature() {
    try {
      const prefs = userConfig?.preferences || {};
      const keys = Object.keys(prefs).sort();
      const sig = keys.map((k) => `${k}:${prefs[k]}`).join("|");
      return this.hashKey(sig);
    } catch (_) {
      return "p0";
    }
  }

  classSignature(classIds = []) {
    try {
      const ids = Array.isArray(classIds)
        ? classIds.slice().sort((a, b) => Number(a) - Number(b))
        : [];
      return this.hashKey(ids.join(","));
    } catch (_) {
      return "c0";
    }
  }

  cacheKey(classIds) {
    const uid = userConfig.userId ?? "anon";
    const type = String(userConfig.userType || "unknown").toLowerCase();
    const pSig = this.prefsSignature();
    const cSig = this.classSignature(classIds || this.classIds || []);
    return `awc:alerts:v1:${this.scope}:${type}:${uid}:${pSig}:${cSig}`;
  }

  readCache(classIds) {
    try {
      const raw = localStorage.getItem(this.cacheKey(classIds));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      const ttlMs =
        this.scope === "nav" ? CacheTTLs.alerts.nav() : CacheTTLs.alerts.body();
      if (!parsed.ts || Date.now() - parsed.ts > ttlMs) return null;
      if (parsed.uid !== userConfig.userId) return null;
      if (!Array.isArray(parsed.list)) return null;
      return parsed.list;
    } catch (_) {
      return null;
    }
  }

  writeCache(list, classIds) {
    try {
      const cap = this.scope === "nav" ? this.limit || 5 : 100;
      const trimmed = Array.isArray(list) ? list.slice(0, cap) : [];
      const sig = this.listSignature(trimmed);
      const value = JSON.stringify({
        ts: Date.now(),
        uid: userConfig.userId,
        sig,
        list: trimmed,
      });
      localStorage.setItem(this.cacheKey(classIds), value);
    } catch (_) {}
  }

  getCachedClassIdsSync() {
    try {
      const userType = String(userConfig.userType || "").toLowerCase();
      const key = `awc:classIds:${userType}:${userConfig.userId}`;
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  preRenderFromCache() {
    const el = document.getElementById(this.targetElementId);
    if (!el) return false;
    // Try using known classIds first, otherwise attempt sync read of classIds cache
    const hintClassIds = Array.isArray(this.classIds)
      ? this.classIds
      : this.getCachedClassIdsSync();
    const cached = this.readCache(hintClassIds);
    if (!cached) return false;
    try {
      NotificationUI.renderList(cached, el);
      this.lastSig = this.listSignature(cached);
      return true;
    } catch (_) {
      return false;
    }
  }

  async start() {
    const el = document.getElementById(this.targetElementId);
    if (!el) return;
    if (userConfig.preferences.turnOffAllNotifications === "Yes") {
      NotificationUI.renderList([], el);
      return Promise.resolve();
    }
    this.classIds = [];
    // Prefetch ownership sets when needed for filters
    const p = userConfig.preferences || {};
    const yes = (v) => String(v).trim().toLowerCase() === "yes";
    const needOwned = !yes(p.announcementComments) && yes(p.commentsOnMyAnnouncements);
    if (needOwned) {
      try {
        const [myAnnouncementIds, myCommentIds] = await Promise.all([
          this.fetchMyAnnouncementIds(),
          this.fetchMyCommentIds(),
        ]);
        this._ownedIds = { myAnnouncementIds, myCommentIds };
      } catch (_) {
        this._ownedIds = { myAnnouncementIds: [], myCommentIds: [] };
      }
    } else {
      this._ownedIds = { myAnnouncementIds: [], myCommentIds: [] };
    }
    this.query = this.buildQuery([]);
    if (
      userConfig?.debug?.notifications &&
      typeof window.__awcRenderAlertsDebug === "function"
    ) {
      try {
        window.__awcRenderAlertsDebug(
          this.lastQueryDebug || {
            preferences: userConfig.preferences,
            userId: userConfig.userId,
          }
        );
      } catch (_) {}
    }
    this.unsubscribeAll();
    const serverObs = this.query.subscribe
      ? this.query.subscribe()
      : this.query.localSubscribe();
    let resolved = false;
    let resolveFirst;
    const firstEmission = new Promise((res) => {
      resolveFirst = res;
    });
    const serverSub = serverObs
      .pipe(window.toMainInstance(true))
      .subscribe((payload) => {
        const raw = Array.isArray(payload?.records)
          ? payload.records
          : Array.isArray(payload)
          ? payload
          : [];
        // Apply client-side slicing only if no server-side limit was set
        const sliced =
          !Number.isFinite(this.limit) || this.limit <= 0
            ? raw
            : raw.slice(0, this.limit);
        const recs = sliced.map(NotificationUtils.mapSdkNotificationToUi);
        const newSig = this.listSignature(recs);
        // Persist to cache for faster warm loads
        this.writeCache(recs, this.classIds);
        const debugInfo = userConfig?.debug?.notifications
          ? (() => {
              const counts = raw.reduce((acc, r) => {
                const t = r.alert_type || "Unknown";
                acc[t] = (acc[t] || 0) + 1;
                return acc;
              }, {});
              return {
                total: raw.length,
                byType: counts,
                sampleIds: raw.slice(0, 10).map((r) => r.id),
                lastQueryDebug: this.lastQueryDebug,
              };
            })()
          : undefined;
        if (!this.lastSig || newSig !== this.lastSig) {
          NotificationUI.renderList(recs, el, debugInfo);
          this.lastSig = newSig;
        }
        if (!resolved) {
          resolved = true;
          resolveFirst();
        }
      }, console.error);
    this.subscriptions = [serverSub];
    return firstEmission;
  }

  unsubscribeAll() {
    this.subscriptions.forEach(
      (sub) => sub && sub.unsubscribe && sub.unsubscribe()
    );
    this.subscriptions = [];
  }

  // For manual refresh if needed
  async forceRefresh() {
    // Rebuild and resubscribe (no fetch/get)
    this.unsubscribeAll();
    if (this.query && typeof this.query.destroy === "function")
      this.query.destroy();
    await this.start();
  }

  listSignature(list) {
    try {
      const items = Array.isArray(list) ? list : [];
      const norm = items
        .map((x) => [
          x.ID,
          x.Is_Read ? 1 : 0,
          x.Alert_Type,
          x.Title,
          x.Date_Added,
          x.Parent_Class_ID,
        ])
        .join("|");
      return this.hashKey(norm);
    } catch (_) {
      return "s0";
    }
  }
}
