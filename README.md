at the moment I have made something that works ok but is not ideal and I think you can do a much better job based on what you have learned about the SDK and also about what ou did with the SEED Northern rivers transactions API script you made.

HEre is the page so far for the accessories shop for an example of how I want the accessories to be able to be viewed and then added to a cart:

https://app.thehappy.clinic/shop

Then I want a proper cart process.

Simialr to what you see here:

https://shop.carinapharmacy.com.au/dry-herb-vapes/dynavap

https://shop.carinapharmacy.com.au/510-batteries/yocan/yocan-kodo-pro-510-battery-black?gn=Yocan&gp=1

https://shop.carinapharmacy.com.au/cart

https://shop.carinapharmacy.com.au/checkout/bc542e35-a08e-f011-a9ad-000d3ad29c49

The thing that I am not sure about that will likely create some complexity is how we use coupons. Ontraport allows us to create dynamic coupons related to a contact. They exist on a contact record or can be used against a product shop wide.

I think you would need to create a coupon validation process like how Ontraport does it but I am not sure how to do it using the API like it is done in an Ontraport Order form. I have asked ontraport if this is possible and will await their response but in the mean time we can leave that off the process to speed up the development.

So for the phase one development this will just be for the accessories we want to sell starting with the /shop page link above. We want patients to be able to add items to their cart, update quantity and then process all with the cart they have on file and update that card on file too.

I also want this to be a system we can sell to other ontraport accounts