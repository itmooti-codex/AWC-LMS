<!--completed. -->
<style>
    textarea {
        margin: 0 !important;
        height: unset !important;
        -webkit-box-shadow: none !important;
        box-shadow: none !important;
        border: 1px solid #D3D7E2 !important;
        outline: none !important;
        border-radius: 4px !important;
        padding: 12px 12px !important;
        width: 100% !important;
        box-sizing: border-box !important;
        background-color: white !important;

        &:hover {
            border: 1px solid #007b8e !important;
        }

        &:active {
            border: 1px solid #007b8e !important;
        }

        &:focus {
            border: 1px solid #007b8e !important;
        }
    }
</style>
<div class=" p-3 mb-4 bg-[#ffc7cd] rounded justify-start items-center gap-4 hidden" id="upload_failed_msg">
    <div data-svg-wrapper class="relative">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M20.6981 7.60962L15.3135 2.225C15.242 2.15359 15.1571 2.09696 15.0637 2.05836C14.9704 2.01975 14.8703 1.99992 14.7692 2H5.53846C5.13044 2 4.73912 2.16209 4.4506 2.45061C4.16209 2.73912 4 3.13044 4 3.53846V20.4615C4 20.8696 4.16209 21.2609 4.4506 21.5494C4.73912 21.8379 5.13044 22 5.53846 22H19.3846C19.7926 22 20.184 21.8379 20.4725 21.5494C20.761 21.2609 20.9231 20.8696 20.9231 20.4615V8.15385C20.9232 8.0528 20.9033 7.95273 20.8647 7.85935C20.8261 7.76597 20.7695 7.68111 20.6981 7.60962ZM15.5385 16.6154H9.38462C9.1806 16.6154 8.98495 16.5343 8.84069 16.3901C8.69643 16.2458 8.61538 16.0502 8.61538 15.8462C8.61538 15.6421 8.69643 15.4465 8.84069 15.3022C8.98495 15.158 9.1806 15.0769 9.38462 15.0769H15.5385C15.7425 15.0769 15.9381 15.158 16.0824 15.3022C16.2266 15.4465 16.3077 15.6421 16.3077 15.8462C16.3077 16.0502 16.2266 16.2458 16.0824 16.3901C15.9381 16.5343 15.7425 16.6154 15.5385 16.6154ZM15.5385 13.5385H9.38462C9.1806 13.5385 8.98495 13.4574 8.84069 13.3132C8.69643 13.1689 8.61538 12.9732 8.61538 12.7692C8.61538 12.5652 8.69643 12.3696 8.84069 12.2253C8.98495 12.081 9.1806 12 9.38462 12H15.5385C15.7425 12 15.9381 12.081 16.0824 12.2253C16.2266 12.3696 16.3077 12.5652 16.3077 12.7692C16.3077 12.9732 16.2266 13.1689 16.0824 13.3132C15.9381 13.4574 15.7425 13.5385 15.5385 13.5385ZM14.7692 8.15385V3.92308L19 8.15385H14.7692Z"
                fill="#C52637" />
        </svg>
    </div>
    <div class="grow shrink basis-0 text-[#c42637] text-sm font-semibold font-['Open Sans'] leading-[18px]"
        id="error-fileName">Assignment 1.docx</div>
    <div class="grow shrink basis-0 text-right text-[#c42637] text-sm font-normal font-['Open Sans'] leading-tight">
        Upload failed !</div>
</div>

<div class="w-full p-10 bg-white cursor-pointer rounded border border-[#bbbcbb] border-dashed flex-col justify-start items-center gap-2 inline-flex overflow-hidden fileUploadMainWrapper hidden"
    @click="
               document.querySelector('#upload_failed_msg').classList.add('hidden');
               document.querySelector('#upload_failed_msg').classList.remove('flex');
               document.querySelector('#fileInput').click();">
    <div data-svg-wrapper class="relative">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M36.6655 24.167V35.2777C36.6655 35.6461 36.5192 35.9993 36.2587 36.2598C35.9983 36.5203 35.645 36.6666 35.2767 36.6666H4.7221C4.35375 36.6666 4.00049 36.5203 3.74004 36.2598C3.47958 35.9993 3.33325 35.6461 3.33325 35.2777V24.167C3.33325 23.7987 3.47958 23.4454 3.74004 23.1849C4.00049 22.9245 4.35375 22.7782 4.7221 22.7782C5.09044 22.7782 5.4437 22.9245 5.70416 23.1849C5.96461 23.4454 6.11094 23.7987 6.11094 24.167V33.8889H33.8878V24.167C33.8878 23.7987 34.0341 23.4454 34.2946 23.1849C34.555 22.9245 34.9083 22.7782 35.2767 22.7782C35.645 22.7782 35.9983 22.9245 36.2587 23.1849C36.5192 23.4454 36.6655 23.7987 36.6655 24.167ZM13.0552 13.0562H18.6105V24.167C18.6105 24.5353 18.7569 24.8886 19.0173 25.1491C19.2778 25.4095 19.631 25.5558 19.9994 25.5558C20.3677 25.5558 20.721 25.4095 20.9814 25.1491C21.2419 24.8886 21.3882 24.5353 21.3882 24.167V13.0562H26.9436C27.2184 13.0565 27.4872 12.9751 27.7158 12.8225C27.9444 12.6699 28.1225 12.453 28.2277 12.199C28.333 11.9451 28.3605 11.6657 28.3068 11.3962C28.2531 11.1266 28.1207 10.879 27.9262 10.6848L20.982 3.74058C20.853 3.61145 20.6998 3.50901 20.5312 3.43912C20.3626 3.36923 20.1819 3.33325 19.9994 3.33325C19.8169 3.33325 19.6361 3.36923 19.4675 3.43912C19.2989 3.50901 19.1458 3.61145 19.0168 3.74058L12.0725 10.6848C11.8781 10.879 11.7456 11.1266 11.692 11.3962C11.6383 11.6657 11.6658 11.9451 11.771 12.199C11.8762 12.453 12.0544 12.6699 12.283 12.8225C12.5116 12.9751 12.7803 13.0565 13.0552 13.0562Z"
                fill="#007C8F" />
        </svg>
    </div>
    <div class="text-[#586a80] text-sm font-normal font-['Open Sans'] leading-tight">Drag and drop files here </div>
    <div class="text-[#586a80] text-sm font-normal font-['Open Sans'] leading-tight">Or</div>
    <div class="px-3 py-2 bg-[#007b8e] rounded justify-center items-center gap-2 inline-flex">
        <div class="text-white text-xs font-semibold font-['Open Sans'] leading-3">Browse files</div>
    </div>
</div>

<!-- File Preview Box -->
<div id="filePreview" class="h-12 p-3 bg-[#c6e5e5] rounded justify-start items-center gap-2 inline-flex"
    style="display: none;">
    <div data-svg-wrapper class="relative">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M20.6981 7.60962L15.3135 2.225C15.242 2.15359 15.1571 2.09696 15.0637 2.05836C14.9704 2.01975 14.8703 1.99992 14.7692 2H5.53846C5.13044 2 4.73912 2.16209 4.4506 2.45061C4.16209 2.73912 4 3.13044 4 3.53846V20.4615C4 20.8696 4.16209 21.2609 4.4506 21.5494C4.73912 21.8379 5.13044 22 5.53846 22H19.3846C19.7926 22 20.184 21.8379 20.4725 21.5494C20.761 21.2609 20.9231 20.8696 20.9231 20.4615V8.15385C20.9232 8.0528 20.9033 7.95273 20.8647 7.85935C20.8261 7.76597 20.7695 7.68111 20.6981 7.60962ZM15.5385 16.6154H9.38462C9.1806 16.6154 8.98495 16.5343 8.84069 16.3901C8.69643 16.2458 8.61538 16.0502 8.61538 15.8462C8.61538 15.6421 8.69643 15.4465 8.84069 15.3022C8.98495 15.158 9.1806 15.0769 9.38462 15.0769H15.5385C15.7425 15.0769 15.9381 15.158 16.0824 15.3022C16.2266 15.4465 16.3077 15.6421 16.3077 15.8462C16.3077 16.0502 16.2266 16.2458 16.0824 16.3901C15.9381 16.5343 15.7425 16.6154 15.5385 16.6154ZM15.5385 13.5385H9.38462C9.1806 13.5385 8.98495 13.4574 8.84069 13.3132C8.69643 13.1689 8.61538 12.9732 8.61538 12.7692C8.61538 12.5652 8.69643 12.3696 8.84069 12.2253C8.98495 12.081 9.1806 12 9.38462 12H15.5385C15.7425 12 15.9381 12.081 16.0824 12.2253C16.2266 12.3696 16.3077 12.5652 16.3077 12.7692C16.3077 12.9732 16.2266 13.1689 16.0824 13.3132C15.9381 13.4574 15.7425 13.5385 15.5385 13.5385ZM14.7692 8.15385V3.92308L19 8.15385H14.7692Z"
                fill="#007C8F" />
        </svg>
    </div>
    <div id="fileName"
        class="grow shrink basis-0 text-[#007b8e] text-sm font-semibold font-['Open Sans'] leading-[18px]">File Name
    </div>
    <div data-svg-wrapper class="dltFileWrap" style="cursor: pointer;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M20.6923 5.07692H16.8462V4.30769C16.8462 3.69565 16.603 3.10868 16.1702 2.67591C15.7375 2.24313 15.1505 2 14.5385 2H9.92308C9.31104 2 8.72407 2.24313 8.29129 2.67591C7.85852 3.10868 7.61538 3.69565 7.61538 4.30769V5.07692H3.76923C3.56522 5.07692 3.36956 5.15797 3.2253 5.30223C3.08104 5.44648 3 5.64214 3 5.84615C3 6.05017 3.08104 6.24582 3.2253 6.39008C3.36956 6.53434 3.56522 6.61538 3.76923 6.61538H4.53846V20.4615C4.53846 20.8696 4.70055 21.2609 4.98907 21.5494C5.27758 21.8379 5.6689 22 6.07692 22H18.3846C18.7926 22 19.184 21.8379 19.4725 21.5494C19.761 21.2609 19.9231 20.8696 19.9231 20.4615V6.61538H20.6923C20.8963 6.61538 21.092 6.53434 21.2362 6.39008C21.3805 6.24582 21.4615 6.05017 21.4615 5.84615C21.4615 5.64214 21.3805 5.44648 21.2362 5.30223C21.092 5.15797 20.8963 5.07692 20.6923 5.07692ZM10.6923 16.6154C10.6923 16.8194 10.6113 17.0151 10.467 17.1593C10.3227 17.3036 10.1271 17.3846 9.92308 17.3846C9.71906 17.3846 9.52341 17.3036 9.37915 17.1593C9.23489 17.0151 9.15385 16.8194 9.15385 16.6154V10.4615C9.15385 10.2575 9.23489 10.0619 9.37915 9.91761C9.52341 9.77335 9.71906 9.69231 9.92308 9.69231C10.1271 9.69231 10.3227 9.77335 10.467 9.91761C10.6113 10.0619 10.6923 10.2575 10.6923 10.4615V16.6154ZM15.3077 16.6154C15.3077 16.8194 15.2266 17.0151 15.0824 17.1593C14.9381 17.3036 14.7425 17.3846 14.5385 17.3846C14.3344 17.3846 14.1388 17.3036 13.9945 17.1593C13.8503 17.0151 13.7692 16.8194 13.7692 16.6154V10.4615C13.7692 10.2575 13.8503 10.0619 13.9945 9.91761C14.1388 9.77335 14.3344 9.69231 14.5385 9.69231C14.7425 9.69231 14.9381 9.77335 15.0824 9.91761C15.2266 10.0619 15.3077 10.2575 15.3077 10.4615V16.6154ZM15.3077 5.07692H9.15385V4.30769C9.15385 4.10368 9.23489 3.90802 9.37915 3.76376C9.52341 3.61951 9.71906 3.53846 9.92308 3.53846H14.5385C14.7425 3.53846 14.9381 3.61951 15.0824 3.76376C15.2266 3.90802 15.3077 4.10368 15.3077 4.30769V5.07692Z"
                fill="#007C8F" />
        </svg>
    </div>
</div>
<div id="progressBarContainer" class="w-full bg-gray-300 h-[2px] rounded-[30px] hidden">
    <div id="uploadProgress" class="h-[2px] bg-[#007C8F]" style="width: 0%;"></div>
</div>
<div class="w-full">
  <div class="containerForToolbar"></div>
<div contenteditable="true" placeholder="Write Your Asssignment..."
    class="resize-y mentionable !min-h-[103px] !p-4 !bg-white !rounded-tl-[4px] !rounded-tr-none !rounded-br-[4px] !rounded-bl-[4px] !border !border-[#bbbcbb] !text-[#586a80] !text-base !font-normal !font-['Open_Sans'] !leading-normal !resize-none !w-full transition"
    id="noteForSubmission">
</div>
</div>
<input type="file" name="uploadFileQueryBuilder" id="fileInput"
    class=" w-full hidden text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none ">
<div class="flex items-center gap-4 justify-end">
    <div class="mt-4 w-fit border border-[#007C8F] cursor-pointer text-[#007C8F] px-4 py-2  rounded flex items-center gap-2 transition hover:!bg-[#00505C] hover:border-[#00505C] group"
        @click="document.querySelector('#fileInput').click();">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path class="group-hover:fill-white"
                d="M10.0385 5.72657C10.0743 5.76228 10.1026 5.80468 10.122 5.85136C10.1413 5.89804 10.1513 5.94807 10.1513 5.9986C10.1513 6.04913 10.1413 6.09916 10.122 6.14584C10.1026 6.19252 10.0743 6.23492 10.0385 6.27063L6.09504 10.2117C5.5902 10.7165 4.90551 11 4.19161 11C3.47771 11 2.79306 10.7163 2.28828 10.2115C1.78351 9.70664 1.49995 9.02195 1.5 8.30805C1.50005 7.59415 1.78369 6.9095 2.28852 6.40472L7.05916 1.56392C7.41958 1.20312 7.90856 1.00027 8.41854 1C8.92851 0.99973 9.41771 1.20206 9.77851 1.56247C10.1393 1.92289 10.3422 2.41187 10.3424 2.92185C10.3427 3.43183 10.1404 3.92102 9.77995 4.28182L5.00835 9.12263C4.79166 9.33933 4.49775 9.46107 4.1913 9.46107C3.88484 9.46107 3.59094 9.33933 3.37425 9.12263C3.15755 8.90593 3.03581 8.61203 3.03581 8.30558C3.03581 7.99912 3.15755 7.70522 3.37425 7.48852L7.37781 3.42151C7.41288 3.3841 7.45508 3.35408 7.50193 3.33322C7.54878 3.31236 7.59932 3.30109 7.65059 3.30005C7.70186 3.29902 7.75282 3.30826 7.80047 3.32721C7.84811 3.34617 7.89149 3.37447 7.92804 3.41044C7.96458 3.44641 7.99357 3.48933 8.01328 3.53667C8.03299 3.58401 8.04304 3.63481 8.04282 3.68609C8.04261 3.73737 8.03213 3.78809 8.01202 3.83526C7.99191 3.88243 7.96257 3.92511 7.92572 3.96077L3.92167 8.0321C3.88582 8.06767 3.85733 8.10995 3.83782 8.15653C3.81831 8.2031 3.80816 8.25307 3.80796 8.30357C3.80776 8.35406 3.81751 8.40411 3.83665 8.45084C3.85579 8.49757 3.88394 8.54008 3.91951 8.57593C3.95507 8.61178 3.99735 8.64027 4.04393 8.65978C4.09051 8.67929 4.14047 8.68944 4.19097 8.68964C4.24147 8.68984 4.29151 8.68009 4.33825 8.66095C4.38498 8.64181 4.42748 8.61365 4.46333 8.57809L9.23445 3.73968C9.45114 3.52343 9.57306 3.22996 9.57338 2.92382C9.57369 2.61768 9.45238 2.32395 9.23613 2.10726C9.01988 1.89056 8.7264 1.76865 8.42026 1.76833C8.11413 1.76801 7.8204 1.88933 7.6037 2.10558L2.83403 6.94446C2.65535 7.12286 2.51355 7.3347 2.41674 7.5679C2.31993 7.80109 2.27 8.05107 2.2698 8.30357C2.2696 8.55606 2.31913 8.80612 2.41557 9.03947C2.51201 9.27282 2.65347 9.48489 2.83187 9.66357C3.01026 9.84225 3.22211 9.98404 3.4553 10.0809C3.6885 10.1777 3.93848 10.2276 4.19097 10.2278C4.44346 10.228 4.69352 10.1785 4.92687 10.082C5.16022 9.98559 5.37229 9.84413 5.55097 9.66573L9.49494 5.72465C9.5673 5.65285 9.6652 5.61272 9.76713 5.61308C9.86906 5.61344 9.96668 5.65426 10.0385 5.72657Z"
                fill="#007C8F" />
        </svg>
        <div class="group-hover:text-white">Attach a file</div>
    </div>

    <div id="uploadButton"
        class="mt-4 w-fit  bg-[#007C8F] cursor-pointer hover:!bg-[#00505C] hover:border-[#00505C]  text-white px-4 py-2  rounded flex items-center gap-2 transition">
        <div>Submit</div>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M10.4282 5.99409C10.4285 6.12138 10.3948 6.24645 10.3306 6.35635C10.2664 6.46625 10.174 6.557 10.0629 6.61922L2.56502 10.9062C2.45742 10.9672 2.33595 10.9995 2.21227 11C2.09832 10.9994 1.98616 10.9715 1.88517 10.9187C1.78417 10.8659 1.69727 10.7898 1.63172 10.6965C1.56617 10.6033 1.52386 10.4958 1.50834 10.3829C1.49282 10.27 1.50453 10.155 1.54249 10.0476L2.74809 6.47767C2.75987 6.44277 2.78216 6.41236 2.8119 6.39062C2.84163 6.36888 2.87736 6.35686 2.9142 6.35622H6.14162C6.19059 6.35633 6.23906 6.34636 6.28402 6.32695C6.32898 6.30754 6.36946 6.27909 6.40296 6.24337C6.43646 6.20765 6.46226 6.16543 6.47875 6.11932C6.49525 6.07321 6.50208 6.0242 6.49884 5.97534C6.49074 5.88348 6.44824 5.79808 6.37985 5.73623C6.31145 5.67438 6.22222 5.64065 6.13002 5.64179H2.91509C2.87772 5.64179 2.84129 5.63008 2.81094 5.60829C2.78058 5.5865 2.75782 5.55574 2.74586 5.52034L1.54026 1.95088C1.49228 1.81406 1.48705 1.66588 1.52529 1.52603C1.56352 1.38617 1.6434 1.26126 1.75432 1.16789C1.86524 1.07451 2.00194 1.01709 2.14626 1.00326C2.29059 0.989426 2.43571 1.01983 2.56234 1.09044L10.0638 5.37209C10.1743 5.43416 10.2662 5.52447 10.3302 5.63377C10.3942 5.74307 10.4281 5.86742 10.4282 5.99409Z"
                fill="white" />
        </svg>
    </div>
</div>


<script>
    document.addEventListener("DOMContentLoaded", function () {
        const fileInput = document.querySelector('input[name="uploadFileQueryBuilder"]');
        const filePreview = document.getElementById('filePreview');
        const fileNameText = document.getElementById('fileName');
        const fileUploadMainWrapper = document.querySelector('.fileUploadMainWrapper');
        const deleteFile = document.querySelector('.dltFileWrap');
        fileInput.addEventListener("change", function () {
            if (fileInput.files.length > 0) {
                fileNameText.textContent = fileInput.files[0].name;
                fileUploadMainWrapper.style.display = 'none';
                filePreview.style.display = 'flex';
            }
        });
        deleteFile.addEventListener("click", function () {
            fileInput.value = '';
            filePreview.style.display = 'none';
        });
    });
</script>
<script>
  const awsParam = "ee037b98f52d6f86c4d3a4cc4522de1e";
  const awsParamUrl = "https://courses.writerscentre.com.au/s/aws";
  const GRAPHQL_ENDPOINTssss = "https://awc.vitalstats.app/api/v1/graphql";
  const apiKeyKey = "mMzQezxyIwbtSc85rFPs3";

  function getStudentEnrollmentID() {
    let urls = window.location.href;
    let matchs = urls.match(/[\?&]eid=(\d+)/);
    return matchs ? parseInt(matchs[1]) : null;
  }
  async function createSubmission(file, assessmentId, studentId, allMentions) {
    const studentEnrollmentID = getStudentEnrollmentID();
    const submissionNote = document.querySelector('#noteForSubmission');
    let formattedContent = submissionNote.innerHTML.trim();
    let formattedContentss = submissionNote.innerHTML;
    //const Submission_Mentions_to_send = Array.from(formattedContentss.matchAll(/data-mention-id="(.*?)"/g)).map(match => ({ unique_id: match[1] })).filter(obj => obj.unique_id);
    const Submission_Mentions_to_send = Array.from(
      formattedContentss.matchAll(/data-mention-id="(.*?)"/g)
    )
    .map((match) => ({ 
        unique_id: match[1],
        has__new__notification: true
      }))
      .filter((obj) => obj.unique_id);

      formattedContent = cleanHTML(formattedContent);
      function cleanHTML(html) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const allowedTags = ['b', 'i', 'u', 'p', 'ul', 'ol', 'li', 'a', 'strong', 'em'];
        const elements = tempDiv.querySelectorAll('*');
        elements.forEach((element) => {
          if (!allowedTags.includes(element.tagName.toLowerCase())) {
            element.remove(); 
          }
        });
        return tempDiv.innerHTML;
      }
        try {
            const fileInput = document.querySelector("#fileInput");
            let fileData = "";
            const file = fileInput.files[0];
            if (file) {
                const fileFields = [{ fieldName: "attachment", file: file }];
                const toSubmitFields = {};
                try {
                    await processFileFields(toSubmitFields, fileFields, awsParam, awsParamUrl);
                    fileData = toSubmitFields.attachment || "";
                } catch (err) {
                    return;
                }
            }
          let fileCategorySubmission ='File';
          let fileNameSubmission ='file.txt';
          if (typeof fileData === "string") {
            try {
              fileData = JSON.parse(fileData);
              fileNameSubmission = fileData.name;
              if (fileData.type.startsWith("image/")) {
                fileCategorySubmission = "Image";
              } else if (fileData.type.startsWith("video/")) {
                fileCategorySubmission = "Video";
              } else if (fileData.type.startsWith("audio/")) {
                fileCategorySubmission = "Audio";
              }
            } catch (err) {
            }
          }

            const payload = {
                file_upload: fileData,
                file_upload_name:fileNameSubmission,
				file_upload_type:fileCategorySubmission,
                assessment_id: assessmentId,
                student_id: studentEnrollmentID,
                submission_note: formattedContentss,
                Student: {
                    student_id: studentId,
                },
                Submission_Mentions: Submission_Mentions_to_send

            };

            return fetch(GRAPHQL_ENDPOINTssss, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Api-Key": apiKeyKey,
                },
                body: JSON.stringify({
                    query: `
  mutation createSubmission(
    $payload: SubmissionCreateInput = null
  ) {
    createSubmission(payload: $payload) {
      file_upload 
	  file_upload_name 
      file_upload_type 
	  unique_id 
	  id
      assessment_id
      student_id
      submission_note
      Student {
        student_id
      }
      Submission_Mentions {
        unique_id  
		 has__new__notification 
      }
    }
  }
  `,
                    variables: { payload },
                }),
            })
                .then(res => res.json())
                .then(data => {
                    if (data.errors) {
                        throw new Error("GraphQL error: " + JSON.stringify(data.errors));
                    }
              document.querySelector('.dltFileWrap').click();
                    return data.data.createSubmission;
                });
        } catch (error) {
            return null;
        }
    }

   function gatherMentionsFromElementt(el) {
       const mentionEls = el.querySelectorAll(".mention-handle[data-mention-id]");
       return [...mentionEls].map(m => ({ unique_id: Number(m.getAttribute("data-mention-id")) }));
   }


  document.addEventListener("DOMContentLoaded", () => {
    const uploadButton = document.querySelector("#uploadButton");
    const progressBar = document.querySelector("#uploadProgress");
    const progressBarContainer = document.querySelector("#progressBarContainer");

    uploadButton.addEventListener("click", async () => {
      const file = document.querySelector("#fileInput").files[0];
      const richTextEditor = uploadButton.closest(".flex.items-center.gap-4.justify-end").previousElementSibling.previousElementSibling;
      const allMentions = gatherMentionsFromElementt(richTextEditor);
      document.querySelector("#noteForSubmission").classList.add('opacity-50');
      status.textContent = "Uploading...";
      if (file) {
        progressBarContainer.style.display = "block";
      }
      progressBar.style.width = "0%";

      // Simulate progress animation
      let progress = 0;
      const interval = setInterval(() => {
        if (progress < 90) {
          progress += 10;
          updateProgress(progress);
        } else {
          clearInterval(interval);
        }
      }, 500);

      try {
        const result = await createSubmission(file, "[Page//Assessment//ID]", "[Visitor//Contact ID]", allMentions);
        clearInterval(interval);
        updateProgress(100);
       
          const uniqueId = result.unique_id;
          const submissionId = result.id;
        const submission_noteCreated = result.submission_note;
       // const createdPersonProfileImage = '[Visitor//Profile Image ##link]';

        const rawCreatedPersonImage = '[Visitor//Profile Image ##link]';
        const defaultCreatedPersonImage = 'https://files.ontraport.com/media/b0456fe87439430680b173369cc54cea.php03bzcx?Expires=4895186056&Signature=fw-mkSjms67rj5eIsiDF9QfHb4EAe29jfz~yn3XT0--8jLdK4OGkxWBZR9YHSh26ZAp5EHj~6g5CUUncgjztHHKU9c9ymvZYfSbPO9JGht~ZJnr2Gwmp6vsvIpYvE1pEywTeoigeyClFm1dHrS7VakQk9uYac4Sw0suU4MpRGYQPFB6w3HUw-eO5TvaOLabtuSlgdyGRie6Ve0R7kzU76uXDvlhhWGMZ7alNCTdS7txSgUOT8oL9pJP832UsasK4~M~Na0ku1oY-8a7GcvvVv6j7yE0V0COB9OP0FbC8z7eSdZ8r7avFK~f9Wl0SEfS6MkPQR2YwWjr55bbJJhZnZA__&Key-Pair-Id=APKAJVAAMVW6XQYWSTNA';

        const createdPersonProfileImage = (!rawCreatedPersonImage || rawCreatedPersonImage === 'https://i.ontraport.com/abc.jpg')
        ? defaultCreatedPersonImage
        : rawCreatedPersonImage;

        const createdPersonName = `[Visitor//Display Name]`; 
        const file_uploadCreated = result.file_upload;
        const file_nameCreated = result.file_upload_name;
        const isUploadValid = (
          file_uploadCreated &&
          file_uploadCreated !== '""' &&
          file_uploadCreated !== 'null' &&
          file_uploadCreated !== 'undefined' &&
          file_uploadCreated !== '[]' &&
          file_uploadCreated !== '{}' &&
          file_nameCreated
        );
        const skeletonLoader = document.querySelector('.loaderSkeletonSubmission');
if (skeletonLoader) {
  skeletonLoader.classList.add('hidden');
}

       const iframeHTML = `
  <div class="bg-white p-4 mb-4 rounded-lg flex flex-col gap-3" x-data="{ showForm: false }" id="mainFileSubmissionList_${submissionId}">
                       <div class="flex items-start justify-between">
                        <div class="flex gap-3 items-start">
                          <img class="w-12 h-12 rounded-full border object-cover" src="${createdPersonProfileImage}" />
                          <div class="flex flex-col gap-1 w-full">
                            <div class="flex items-center gap-2">
                              <div class="font-semibold">${createdPersonName}</div>
                              <span class="text-xs px-2 py-1 rounded-full bg-[#C7E6E6] text-[#007C8F]">
                               Student
                              </span>
                            </div>
                            <div class="text-xs text-gray-500">Just Now</div>
                          </div>
                        </div>
                        
                        <div class="cursor-pointer" @click="toDeletSubmission=${submissionId};deleteSubmissionModal=true">
                            <svg width="24" height="24" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.3462 2.53846H8.42308V2.15385C8.42308 1.84783 8.30151 1.55434 8.08512 1.33795C7.86874 1.12157 7.57525 1 7.26923 1H4.96154C4.65552 1 4.36203 1.12157 4.14565 1.33795C3.92926 1.55434 3.80769 1.84783 3.80769 2.15385V2.53846H1.88462C1.78261 2.53846 1.68478 2.57898 1.61265 2.65111C1.54052 2.72324 1.5 2.82107 1.5 2.92308C1.5 3.02508 1.54052 3.12291 1.61265 3.19504C1.68478 3.26717 1.78261 3.30769 1.88462 3.30769H2.26923V10.2308C2.26923 10.4348 2.35027 10.6304 2.49453 10.7747C2.63879 10.919 2.83445 11 3.03846 11H9.19231C9.39632 11 9.59198 10.919 9.73624 10.7747C9.88049 10.6304 9.96154 10.4348 9.96154 10.2308V3.30769H10.3462C10.4482 3.30769 10.546 3.26717 10.6181 3.19504C10.6902 3.12291 10.7308 3.02508 10.7308 2.92308C10.7308 2.82107 10.6902 2.72324 10.6181 2.65111C10.546 2.57898 10.4482 2.53846 10.3462 2.53846ZM4.57692 2.15385C4.57692 2.05184 4.61745 1.95401 4.68957 1.88188C4.7617 1.80975 4.85953 1.76923 4.96154 1.76923H7.26923C7.37124 1.76923 7.46907 1.80975 7.5412 1.88188C7.61332 1.95401 7.65385 2.05184 7.65385 2.15385V2.53846H4.57692V2.15385ZM9.19231 10.2308H3.03846V3.30769H9.19231V10.2308ZM5.34615 5.23077V8.30769C5.34615 8.4097 5.30563 8.50753 5.2335 8.57966C5.16137 8.65179 5.06354 8.69231 4.96154 8.69231C4.85953 8.69231 4.7617 8.65179 4.68957 8.57966C4.61745 8.50753 4.57692 8.4097 4.57692 8.30769V5.23077C4.57692 5.12876 4.61745 5.03093 4.68957 4.95881C4.7617 4.88668 4.85953 4.84615 4.96154 4.84615C5.06354 4.84615 5.16137 4.88668 5.2335 4.95881C5.30563 5.03093 5.34615 5.12876 5.34615 5.23077ZM7.65385 5.23077V8.30769C7.65385 8.4097 7.61332 8.50753 7.5412 8.57966C7.46907 8.65179 7.37124 8.69231 7.26923 8.69231C7.16722 8.69231 7.0694 8.65179 6.99727 8.57966C6.92514 8.50753 6.88462 8.4097 6.88462 8.30769V5.23077C6.88462 5.12876 6.92514 5.03093 6.99727 4.95881C7.0694 4.88668 7.16722 4.84615 7.26923 4.84615C7.37124 4.84615 7.46907 4.88668 7.5412 4.95881C7.61332 5.03093 7.65385 5.12876 7.65385 5.23077Z" fill="#007C8F"></path>
                          </svg>
                        </div>
                        
                      </div>

                        <div class="text-gray-700 prose max-w-none">${submission_noteCreated}</div>
                 

                         ${isUploadValid ? `
                            <a href="${file_uploadCreated}" class="bg-[#C7E6E6] !text-[#007C8F]  rounded p-4 !flex test-white cursor-pointer items-centre justify-between" target="_blank">
                              <div>${file_nameCreated || file_uploadCreated}</div>
                              <div class="!size-6">
                                <svg width="21" height="14" viewBox="0 0 21 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M20.4425 6.39667C20.4133 6.33084 19.7075 4.765 18.1383 3.19584C16.0475 1.105 13.4067 0 10.5 0C7.59333 0 4.9525 1.105 2.86166 3.19584C1.29249 4.765 0.583325 6.33334 0.557492 6.39667C0.519586 6.48193 0.5 6.5742 0.5 6.6675C0.5 6.76081 0.519586 6.85308 0.557492 6.93834C0.586659 7.00417 1.29249 8.56917 2.86166 10.1383C4.9525 12.2283 7.59333 13.3333 10.5 13.3333C13.4067 13.3333 16.0475 12.2283 18.1383 10.1383C19.7075 8.56917 20.4133 7.00417 20.4425 6.93834C20.4804 6.85308 20.5 6.76081 20.5 6.6675C20.5 6.5742 20.4804 6.48193 20.4425 6.39667ZM10.5 10C9.84073 10 9.19626 9.80451 8.6481 9.43824C8.09993 9.07197 7.67269 8.55137 7.4204 7.94228C7.16811 7.3332 7.1021 6.66297 7.23071 6.01637C7.35933 5.36977 7.6768 4.77582 8.14298 4.30965C8.60915 3.84347 9.20309 3.526 9.8497 3.39738C10.4963 3.26877 11.1665 3.33478 11.7756 3.58707C12.3847 3.83936 12.9053 4.26661 13.2716 4.81477C13.6378 5.36293 13.8333 6.0074 13.8333 6.66667C13.8333 7.55073 13.4821 8.39857 12.857 9.0237C12.2319 9.64882 11.3841 10 10.5 10Z" fill="#007C8F"/>
                                </svg>
                              </div>
                            </a>
                          ` : ''}

                  <div class="flex gap-2 mt-2">
                    <div class="roundedButton commentVoteButton cursor-pointer justify-center items-center gap-2 flex " data-commentvoteid='${submissionId}'
                    onclick="voteOnSubmission('${submissionId}', this)"
                  >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.309 5.81653C14.1749 5.66459 14.01 5.54291 13.8253 5.45958C13.6406 5.37625 13.4402 5.33318 13.2376 5.33322H9.90438V4.38087C9.90438 3.74942 9.65354 3.14384 9.20704 2.69734C8.76054 2.25084 8.15496 2 7.52351 2C7.43505 1.99994 7.34832 2.02452 7.27304 2.07099C7.19777 2.11746 7.13692 2.18397 7.09734 2.26309L4.84861 6.76174H2.2856C2.03302 6.76174 1.79079 6.86207 1.61219 7.04067C1.43359 7.21927 1.33325 7.46151 1.33325 7.71409V12.952C1.33325 13.2046 1.43359 13.4468 1.61219 13.6254C1.79079 13.804 2.03302 13.9043 2.2856 13.9043H12.5233C12.8714 13.9045 13.2075 13.7775 13.4685 13.5474C13.7296 13.3172 13.8976 12.9997 13.9411 12.6544L14.6554 6.9403C14.6807 6.73913 14.6629 6.53488 14.6032 6.34112C14.5435 6.14736 14.4432 5.96854 14.309 5.81653ZM2.2856 7.71409H4.66647V12.952H2.2856V7.71409Z" fill="#007C8F"></path>
                      </svg>
                      <div class="text-xs font-semibold font-['Open Sans'] leading-3 submissionVoteCount">0</div>
                    </div>

                     <div x-on:click="let editor = document.querySelector('.createdSubmission_${submissionId}');NewMentionManager.initEditor(editor); showForm = !showForm" class="text-xs text-cyan-700 font-semibold border px-3 py-1 rounded-full  cursor-pointer flex items-center gap-1" :class="showForm ? 'bg-[#007c8f] text-[#fff]' : 'text-[#007c8f]'" >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path :class="showForm ? ' !fill-[#fff]' : '!fill-[#007c8f]'"  d="M22 12C22 12.221 21.9122 12.433 21.7559 12.5893C21.5996 12.7455 21.3877 12.8333 21.1667 12.8333H12.8333V21.1667C12.8333 21.3877 12.7455 21.5996 12.5893 21.7559C12.433 21.9122 12.221 22 12 22C11.779 22 11.567 21.9122 11.4107 21.7559C11.2545 21.5996 11.1667 21.3877 11.1667 21.1667V12.8333H2.83333C2.61232 12.8333 2.40036 12.7455 2.24408 12.5893C2.0878 12.433 2 12.221 2 12C2 11.779 2.0878 11.567 2.24408 11.4107C2.40036 11.2545 2.61232 11.1667 2.83333 11.1667H11.1667V2.83333C11.1667 2.61232 11.2545 2.40036 11.4107 2.24408C11.567 2.0878 11.779 2 12 2C12.221 2 12.433 2.0878 12.5893 2.24408C12.7455 2.40036 12.8333 2.61232 12.8333 2.83333V11.1667H21.1667C21.3877 11.1667 21.5996 11.2545 21.7559 11.4107C21.9122 11.567 22 11.779 22 12Z" fill="#007C8F"/>
                    </svg>
                    <div>Comment</div>
    				</div>
                  </div>

                  <div x-show="showForm" class="w-full">
                   <div class="flex flex-col items-start justify-start gap-3 rounded bg-[#FFFFFF] p-4 pt-0">
            <div class="flex w-full flex-col items-start justify-start gap-4">
              <div id="submissionComment" class="submissionCommentForm w-full" x-show="showForm">
                <div class="containerForToolbar"></div>
                <form class="relative flex w-full flex-col items-start justify-between overflow-hidden rounded" data-submissionId = '${submissionId}'>
                  <div class="!relative !h-full !w-full">
                    <div id="tributeEditor" class="mentionable createdSubmission_${submissionId} formTextArea !min-h-[100px] w-full resize-y p-4" contenteditable="true" >
                      <span class="mention-placeholder text-[#586a80] text-base font-normal leading-normal pointer-events-none select-none">
        Type @Name to mention members
      </span>
                    </div>
                    <div class="filePreviewWrapper label max-[600px]:button absolute bottom-[1rem] left-[1rem] hidden w-max bg-[#c6e5e5] px-3 py-2 text-[#007b8e]"></div>
                    <div class="!absolute !right-[1rem] !bottom-[1rem] flex items-center justify-end gap-2">
                      <div class="fieldHolder relative flex items-center gap-2">
                        <button type="button" class="outlineButton attachBtn group relative flex items-center gap-2 rounded hover:border-[#00505C] hover:!bg-[#00505C]">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path class="group-hover:fill-white" d="M10.0385 5.72657C10.0743 5.76228 10.1026 5.80468 10.122 5.85136C10.1413 5.89804 10.1513 5.94807 10.1513 5.9986C10.1513 6.04913 10.1413 6.09916 10.122 6.14584C10.1026 6.19252 10.0743 6.23492 10.0385 6.27063L6.09504 10.2117C5.5902 10.7165 4.90551 11 4.19161 11C3.47771 11 2.79306 10.7163 2.28828 10.2115C1.78351 9.70664 1.49995 9.02195 1.5 8.30805C1.50005 7.59415 1.78369 6.9095 2.28852 6.40472L7.05916 1.56392C7.41958 1.20312 7.90856 1.00027 8.41854 1C8.92851 0.99973 9.41771 1.20206 9.77851 1.56247C10.1393 1.92289 10.3422 2.41187 10.3424 2.92185C10.3427 3.43183 10.1404 3.92102 9.77995 4.28182L5.00835 9.12263C4.79166 9.33933 4.49775 9.46107 4.1913 9.46107C3.88484 9.46107 3.59094 9.33933 3.37425 9.12263C3.15755 8.90593 3.03581 8.61203 3.03581 8.30558C3.03581 7.99912 3.15755 7.70522 3.37425 7.48852L7.37781 3.42151C7.41288 3.3841 7.45508 3.35408 7.50193 3.33322C7.54878 3.31236 7.59932 3.30109 7.65059 3.30005C7.70186 3.29902 7.75282 3.30826 7.80047 3.32721C7.84811 3.34617 7.89149 3.37447 7.92804 3.41044C7.96458 3.44641 7.99357 3.48933 8.01328 3.53667C8.03299 3.58401 8.04304 3.63481 8.04282 3.68609C8.04261 3.73737 8.03213 3.78809 8.01202 3.83526C7.99191 3.88243 7.96257 3.92511 7.92572 3.96077L3.92167 8.0321C3.88582 8.06767 3.85733 8.10995 3.83782 8.15653C3.81831 8.2031 3.80816 8.25307 3.80796 8.30357C3.80776 8.35406 3.81751 8.40411 3.83665 8.45084C3.85579 8.49757 3.88394 8.54008 3.91951 8.57593C3.95507 8.61178 3.99735 8.64027 4.04393 8.65978C4.09051 8.67929 4.14047 8.68944 4.19097 8.68964C4.24147 8.68984 4.29151 8.68009 4.33825 8.66095C4.38498 8.64181 4.42748 8.61365 4.46333 8.57809L9.23445 3.73968C9.45114 3.52343 9.57306 3.22996 9.57338 2.92382C9.57369 2.61768 9.45238 2.32395 9.23613 2.10726C9.01988 1.89056 8.7264 1.76865 8.42026 1.76833C8.11413 1.76801 7.8204 1.88933 7.6037 2.10558L2.83403 6.94446C2.65535 7.12286 2.51355 7.3347 2.41674 7.5679C2.31993 7.80109 2.27 8.05107 2.2698 8.30357C2.2696 8.55606 2.31913 8.80612 2.41557 9.03947C2.51201 9.27282 2.65347 9.48489 2.83187 9.66357C3.01026 9.84225 3.22211 9.98404 3.4553 10.0809C3.6885 10.1777 3.93848 10.2276 4.19097 10.2278C4.44346 10.228 4.69352 10.1785 4.92687 10.082C5.16022 9.98559 5.37229 9.84413 5.55097 9.66573L9.49494 5.72465C9.5673 5.65285 9.6652 5.61272 9.76713 5.61308C9.86906 5.61344 9.96668 5.65426 10.0385 5.72657Z" fill="#007C8F" />
                          </svg>
                          <span class="label w-max group-hover:text-white max-[650px]:hidden">Attach a File</span>
                          <!-- Added unique ID to file input -->
                          <input type="file" id="attachment-file-input" class="formFileInput absolute top-0 left-0 w-full !opacity-0" />
                        </button>
                        <button type="button" class="outlineButton refreshBtn group relative flex hidden items-center gap-2 rounded hover:border-[#00505C] hover:!bg-[#00505C]">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path class="group-hover:fill-white" d="M2.91667 3.64897H0.416667C0.30616 3.64897 0.200179 3.60508 0.122039 3.52694C0.0438989 3.4488 1.29084e-07 3.34281 1.29084e-07 3.23231V0.732308C-6.47615e-05 0.649852 0.0243372 0.56923 0.0701166 0.500649C0.115896 0.432068 0.180995 0.378612 0.257171 0.347049C0.333347 0.315485 0.417176 0.307233 0.498045 0.323338C0.578913 0.339442 0.653185 0.379178 0.711458 0.437517L1.66667 1.39377C2.58969 0.502961 3.8214 0.00355674 5.10417 1.65039e-05H5.13177C6.43806 -0.00334876 7.69309 0.508056 8.625 1.42345C8.70109 1.5013 8.7437 1.60583 8.7437 1.71469C8.74371 1.82354 8.70111 1.92808 8.62503 2.00593C8.54895 2.08378 8.44542 2.12877 8.33659 2.13126C8.22776 2.13376 8.12228 2.09357 8.04271 2.01929C7.26593 1.25683 6.22022 0.830799 5.13177 0.83335H5.10833C4.04593 0.836357 3.02534 1.24772 2.25781 1.98231L3.21146 2.93752C3.2698 2.99579 3.30953 3.07006 3.32564 3.15093C3.34174 3.2318 3.33349 3.31563 3.30193 3.3918C3.27036 3.46798 3.21691 3.53308 3.14833 3.57886C3.07974 3.62464 2.99912 3.64904 2.91667 3.64897ZM9.58333 6.14897H7.08333C7.00088 6.14891 6.92025 6.17331 6.85167 6.21909C6.78309 6.26487 6.72964 6.32997 6.69807 6.40615C6.66651 6.48232 6.65826 6.56615 6.67436 6.64702C6.69047 6.72789 6.7302 6.80216 6.78854 6.86043L7.74219 7.81564C6.97503 8.55067 5.95463 8.9626 4.89219 8.96616H4.86875C3.7803 8.96871 2.73459 8.54268 1.95781 7.78022C1.919 7.74052 1.87265 7.70897 1.82148 7.68744C1.77031 7.6659 1.71535 7.65481 1.65983 7.65481C1.60431 7.65481 1.54935 7.66591 1.49818 7.68746C1.44701 7.709 1.40066 7.74055 1.36185 7.78026C1.32305 7.81996 1.29257 7.86702 1.27221 7.91868C1.25185 7.97033 1.24202 8.02553 1.24329 8.08103C1.24457 8.13654 1.25692 8.19123 1.27963 8.24189C1.30233 8.29256 1.33494 8.33817 1.37552 8.37606C2.30743 9.29146 3.56246 9.80286 4.86875 9.79949H4.89583C6.1786 9.79595 7.41031 9.29655 8.33333 8.40575L9.28958 9.36199C9.348 9.42007 9.42233 9.45952 9.50317 9.47537C9.584 9.49122 9.66772 9.48276 9.74375 9.45104C9.81978 9.41933 9.8847 9.36579 9.93031 9.29719C9.97591 9.22859 10.0002 9.14802 10 9.06564V6.56564C10 6.45513 9.9561 6.34915 9.87796 6.27101C9.79982 6.19287 9.69384 6.14897 9.58333 6.14897Z" fill="#007C8F" />
                          </svg>
                          <span class="label w-max group-hover:text-white max-[650px]:hidden">Replace</span>
                        </button>
                        <button type="button" class="outlineButton deleteBtn group relative flex hidden items-center gap-2 rounded hover:border-[#00505C] hover:!bg-[#00505C]">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.3462 2.53846H8.42308V2.15385C8.42308 1.84783 8.30151 1.55434 8.08512 1.33795C7.86874 1.12157 7.57525 1 7.26923 1H4.96154C4.65552 1 4.36203 1.12157 4.14565 1.33795C3.92926 1.55434 3.80769 1.84783 3.80769 2.15385V2.53846H1.88462C1.78261 2.53846 1.68478 2.57898 1.61265 2.65111C1.54052 2.72324 1.5 2.82107 1.5 2.92308C1.5 3.02508 1.54052 3.12291 1.61265 3.19504C1.68478 3.26717 1.78261 3.30769 1.88462 3.30769H2.26923V10.2308C2.26923 10.4348 2.35027 10.6304 2.49453 10.7747C2.63879 10.919 2.83445 11 3.03846 11H9.19231C9.39632 11 9.59198 10.919 9.73624 10.7747C9.88049 10.6304 9.96154 10.4348 9.96154 10.2308V3.30769H10.3462C10.4482 3.30769 10.546 3.26717 10.6181 3.19504C10.6902 3.12291 10.7308 3.02508 10.7308 2.92308C10.7308 2.82107 10.6902 2.72324 10.6181 2.65111C10.546 2.57898 10.4482 2.53846 10.3462 2.53846ZM4.57692 2.15385C4.57692 2.05184 4.61745 1.95401 4.68957 1.88188C4.7617 1.80975 4.85953 1.76923 4.96154 1.76923H7.26923C7.37124 1.76923 7.46907 1.80975 7.5412 1.88188C7.61332 1.95401 7.65385 2.05184 7.65385 2.15385V2.53846H4.57692V2.15385ZM9.19231 10.2308H3.03846V3.30769H9.19231V10.2308ZM5.34615 5.23077V8.30769C5.34615 8.4097 5.30563 8.50753 5.2335 8.57966C5.16137 8.65179 5.06354 8.69231 4.96154 8.69231C4.85953 8.69231 4.7617 8.65179 4.68957 8.57966C4.61745 8.50753 4.57692 8.4097 4.57692 8.30769V5.23077C4.57692 5.12876 4.61745 5.03093 4.68957 4.95881C4.7617 4.88668 4.85953 4.84615 4.96154 4.84615C5.06354 4.84615 5.16137 4.88668 5.2335 4.95881C5.30563 5.03093 5.34615 5.12876 5.34615 5.23077ZM7.65385 5.23077V8.30769C7.65385 8.4097 7.61332 8.50753 7.5412 8.57966C7.46907 8.65179 7.37124 8.69231 7.26923 8.69231C7.16722 8.69231 7.0694 8.65179 6.99727 8.57966C6.92514 8.50753 6.88462 8.4097 6.88462 8.30769V5.23077C6.88462 5.12876 6.92514 5.03093 6.99727 4.95881C7.0694 4.88668 7.16722 4.84615 7.26923 4.84615C7.37124 4.84615 7.46907 4.88668 7.5412 4.95881C7.61332 5.03093 7.65385 5.12876 7.65385 5.23077Z" fill="#007C8F" />
                          </svg>
                          <span class="label w-max group-hover:text-white max-[650px]:hidden">Delete</span>
                        </button>
                      </div>
                      <button type="submit" class="primaryButton flex items-center gap-2 rounded hover:border-[#00505C] hover:!bg-[#00505C]">
                        <span class="label max-[600px]:button w-max text-[#ffffff]">Post</span>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10.4282 5.99409C10.4285 6.12138 10.3948 6.24645 10.3306 6.35635C10.2664 6.46625 10.174 6.55701 10.0629 6.61922L2.56502 10.9062C2.45742 10.9672 2.33595 10.9995 2.21227 11C2.09832 10.9994 1.98616 10.9715 1.88517 10.9187C1.78417 10.8659 1.69727 10.7898 1.63172 10.6965C1.56617 10.6033 1.52386 10.4958 1.50834 10.3829C1.49282 10.27 1.50453 10.155 1.54249 10.0476L2.74809 6.47767C2.75987 6.44277 2.78216 6.41236 2.8119 6.39062C2.84163 6.36888 2.87736 6.35686 2.9142 6.35622H6.14162C6.19059 6.35633 6.23906 6.34636 6.28402 6.32695C6.32898 6.30754 6.36946 6.27909 6.40296 6.24337C6.43646 6.20765 6.46226 6.16543 6.47875 6.11932C6.49525 6.07321 6.50208 6.0242 6.49884 5.97534C6.49074 5.88348 6.44824 5.79808 6.37985 5.73623C6.31145 5.67438 6.22222 5.64065 6.13002 5.64179H2.91509C2.87772 5.64179 2.84129 5.63008 2.81094 5.60829C2.78058 5.5865 2.75782 5.55574 2.74586 5.52034L1.54026 1.95088C1.49228 1.81406 1.48705 1.66588 1.52529 1.52603C1.56352 1.38617 1.6434 1.26126 1.75432 1.16789C1.86524 1.07451 2.00194 1.01709 2.14626 1.00326C2.29059 0.989426 2.43571 1.01983 2.56234 1.09044L10.0638 5.37209C10.1743 5.43416 10.2662 5.52447 10.3302 5.63377C10.3942 5.74307 10.4281 5.86742 10.4282 5.99409Z" fill="white" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
                  </div>
                  <div x-data="{ showAllCommentOnSubmission: true }" >
                  <div class='commentContainer_${submissionId}' x-show="showAllCommentOnSubmission">
                  </div>
                </div>
                </div>
        

`;
const tempDiv = document.createElement("div");
tempDiv.innerHTML = iframeHTML.trim();
const iframe = tempDiv.firstElementChild;

const submissionsContainer = document.querySelector("#submissionList");
if (submissionsContainer) {
  submissionsContainer.insertBefore(iframe, submissionsContainer.firstChild);
} else {
  console.error("Element with ID 'submissionList' not found");
}

          document.querySelector("#noteForSubmission").classList.remove('opacity-50');
          document.querySelector('#noteForSubmission').innerHTML = '';
        
      } catch (error) {
        clearInterval(interval);
        updateProgress(100);
        document.querySelector("#noteForSubmission").classList.remove('opacity-50');
        document.querySelector("#upload_failed_msg").textContent = file.name;
        document.querySelector("#upload_failed_msg").classList.remove("hidden");
        document.querySelector("#upload_failed_msg").classList.add("flex");
        document.querySelector(".dltFileWrap").click();
        document.querySelector('#noteForSubmission').innerHTML = '';
      } finally {
        setTimeout(() => progressBarContainer.style.display = "none", 1000);
      }
    });
  });

  function updateProgress(progress) {
    const progressBar = document.querySelector("#uploadProgress");
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
  }
</script>
<script>
    function decodeAwsParam(awsParam) {
        if (!awsParam) {
            awsParam = window.awsParam;
        }
        const serializedString = atob(awsParam);
        const hashMatch = serializedString.match(/s:\d+:"([a-f0-9]+)"/);
        const expiryMatch = serializedString.match(/i:(\d+)/);

        return {
            hash: hashMatch ? hashMatch[1] : null,
            expiry: expiryMatch ? parseInt(expiryMatch[1], 10) : null,
        };
    }
    function encodeAwsParam(hash, currentEpoch) {
        if (typeof currentEpoch !== "number") {
            currentEpoch = Math.round(Date.now() / 1000);
        }
        const expiry = new Date(currentEpoch * 1000);
        expiry.setTime(expiry.getTime() + 12 * 60 * 60 * 1000);
        return btoa(
            `a:2:{s:4:"hash";s:${hash.length}:"${hash}";s:6:"expiry";i:${Math.round(
                expiry.getTime() / 1000
            )};}`
        );
    }
    function createS3FileId(key, filename) {
        return `${key.replace("_${filename}", "")}_${filename}`;
    }
    function getS3UploadParams(awsParam, url) {
        if (typeof awsParam !== "string") {
            awsParam = window.awsParam;
        }
        if (typeof url !== "string") {
            url = `//${window.location.host}/s/aws`;
        }
        const formData = new FormData();
        formData.append("awsParam", JSON.stringify(awsParam));
        return fetch(url, {
            method: "POST",
            body: formData,
        })
            .then((res) => res.json())
            .then((object) => {
                if (object.code === 0 && object.data) {
                    console.log("object data is", object.data);
                    return object.data;
                }
                return null;
            });
    }
    function uploadFiles(filesToUpload, s3Params, toSubmit) {
        console.log(s3Params, "s3Params");
        const paramsInputs = s3Params.inputs;
        const method = s3Params.attributes.method;
        const action = s3Params.attributes.action;
        const uploadPromises = filesToUpload.map(({ file, fieldName }) => {
            return new Promise((resolve) => {
                let s3FormData = new FormData();
                // Append all required S3 fields
                for (const key in paramsInputs) {
                    s3FormData.append(key, paramsInputs[key]);
                }
                // Append the actual file
                s3FormData.append("Content-Type", file.type);
                s3FormData.append("file", file, file.name);
                let xhr = new XMLHttpRequest();
                xhr.open(method, action);
                xhr.onloadend = function () {
                    if (xhr.status === 204) {
                        let s3Id = createS3FileId(paramsInputs.key, file.name);
                        const result = {
                            name: file.name,
                            type: file.type,
                            s3_id: s3Id,
                        };
                        if (toSubmit && fieldName) {
                            toSubmit[fieldName] = JSON.stringify(result);
                        }
                        resolve(result);
                    } else {
                        console.error("File upload failed", xhr.statusText);
                        resolve(null);
                    }
                };

                xhr.send(s3FormData);
            });
        });

        return Promise.all(uploadPromises);
    }
    function processFileFields(toSubmit, filesToUpload, awsParamHash, awsParamUrl) {
        let awsParam;
        if (!awsParamHash) {
            awsParam = window.awsParam;
        } else if (typeof awsParamHash === "string") {
            awsParam = encodeAwsParam(awsParamHash);
        }

        return getS3UploadParams(awsParam, awsParamUrl).then((s3Params) => {
            if (!s3Params) {
                const e = new Error("Failed to retrieve s3Params.");
                e.failures = filesToUpload;
                throw e;
            }
            return uploadFiles(filesToUpload, s3Params, toSubmit).then((result) => {
                let error;
                for (let i = 0; i < result.length; i++) {
                    if (!result[i]) {
                        if (!error) {
                            error = new Error("One or more files failed to upload.");
                            error.failures = [];
                        }
                        error.failures.push(filesToUpload[i]);
                    }
                }
                if (error) {
                    throw error;
                }
                return toSubmit;
            });
        });
    }
</script>