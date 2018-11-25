//Global variable to maintain bearer
var bearer = 'YCSAFOFLWL32Z6TW6KY3Z7Z4MQOBLOIVQZCTJ2GN66R3O5BDZGMZOYIT5SPNEJ25RQJAKXMTRWZXMQYPJEABLLAZ2ORAVTELPK4VWDA';


$(document).ready(function () {
	// Trigger file upload when user clicks virtual upload button
	$("#visibleLabel").click(function () {
		$("#imageBtn").click();
	})

	// Capture the selected image and proceed
	$("#imageBtn").change(function () {
		var preview = document.getElementById('preview');
		var file = document.querySelector('input[type=file]').files[0];
		var reader = new FileReader();
		$("#preview").addClass("shown")

		//Show preview of selected image to the user
		reader.addEventListener("load", function () {
			preview.src = reader.result;
		}, false);

		//Use readAsDataURL() to read contents of the image/file
		//Reference - https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
		if (file) {
			reader.readAsDataURL(file);
		}

		//Use Einstein Predict to get content of the image
		var formData = new FormData();
		formData.append('sampleContent', file);
		formData.append('modelId', 'GeneralImageClassifier');
		$("#overlay").addClass('shown');
		$(".spinner").addClass('shown');

		$.ajax({
			url: 'https://api.einstein.ai/v2/vision/predict',
			method: 'POST',
			headers: {
				'Authorization': 'Bearer ' + bearer,
				'Cache-Control': 'no-cache'
			},
			data: formData,
			processData: false,
			contentType: false
		}).done(function (res) {
			console.log(res);
			getProducts(res);
		});
	});

});



// Get products from REI based on predicted keyword by Einstein
function getProducts(res) {
	// Get the first predicted keyword
	var bestFit = res.probabilities[0].label;
	var searchParam = bestFit.split(",")[0];
	$('#REIproducts').html('');
	$('#predictedPlace').html('');
	$("#predictedPlace").append(searchParam);
	$('.predict').addClass('shown');

	// Fetch products from REI
	$.ajax({
		url: 'https://www.rei.com/search-ui/rest/search/products/results?q='+searchParam +'',
		method: 'GET',
		processData: false,
		contentType: false
	}).done(function (res) {
		console.log(res.results);
		showREIProducts(res.results);
	});
}

// Build DOM based on REI response
function showREIProducts(items) {
	var tagBuilder = '';

	// If products exist based on keyword
	if (items.length > 0) {
		tagBuilder =  '<p class="resultsTitle"> Consider packing these items</p>';
		for (var i = 0; i < items.length; i++) {
			var eSentiment = getRandomReview();
			console.log(eSentiment)

			tagBuilder += '<div class="prod"><a target="_blank" class="link-primary" href=https://www.rei.com' + items[i].link + '><img src="' + items[i].thumbnailImageLink + '"></img><p class="prod_name">' + items[i].title + '</p><p class="prod_price">$' + items[i].regularPrice + '</p></p><p class="sentiment">Avg. reviews: ' + eSentiment + '</p>More details</a></div>'
		}
	} else {
		// If no search results, display error
		tagBuilder = "<p id='error'>No results</p>"
	}

	// Append built DOM to results list
	$('#REIproducts').append(tagBuilder);
	$('#second').text('another');
	// Hide overlay and spinner
	$("#overlay").removeClass('shown');
	$(".spinner").removeClass('shown');
}

// Get Sentiment of User reviews
// User reviews are taken from REI websites, this could also be fetched from APIs in the future
function getRandomReview() {
	var reviewsArray = ["For the price you won't find a better deal. The brakes are wonderful, shifting is easy, handles great and very sturdy but still lightweight thanks to the aluminum frame. Good 1st bike if you're looking to get into trail riding. Took it to Letchworth state park a few times and I can't wait to go back for more! If you're a more experienced rider there's a lot of room to upgrade to suit your needs. I ordered some replacement pedals and larger handlebar grips, stock are good but I have big hands like a wider grip. I'll be getting some new tires once these wear down a bit. Love this bike!",
		"This is my first mountain/trail bike. I got to say I am loving it. The 27.5 inch tires are a great size. The shifting is smooth, tires really grip the trail and honestly do all the work. Pedals are plastic and will need to be replaced. One of mine broke while riding around the house. Called my local REI and they replaced them with upgraded XLC pedals free of charge. Great bike with all the essential components to get you going at a Great Price.",
		"I was happy with the bike for the first 5miles, but the rear derailure broke when down shifting to go uphill, and rei replaced it for me for free, which again was great. I took it out for the first ride with the new derailure and it broke in the same place, less then 100ft later. So, very disappointed",
		"I have had this bike for a year. It sat in the garage for about 10 months. The second time I took it out the back wheel came off. As I was trying to replace the pedals I discovered that they threaded it wrong! Other than that the bike has decent ride I wouldn't buy this bike again or recommend it though.",
		"So far I have put about 4 miles on, 1 mile on roads, 3 on trails. My biggest complaint with only a few miles on it is the saddle. Since I am using this bike on surface streets and trails I'm going to be upgrading to a saddle with more padding. With a softer saddle I would give this bike 4 stars.",
		"Decent bike for beginners. The seat becomes loose pretty easily. The reason for the 3 stars is that the price dropped after 2 weeks after the purhase date and I was unable to get a refund for the difference. Bummer",
		"Great value, comfortable helmet. Unfortunately, not dog proof--parent's puppy ate the helmet after a single use, and I'm 99% certain the return policy doesn't cover that. Dang.",
		"This bike is just awesome. I never had one like that before. I'm not a very experienced biker and I was first a little nervous about how and when to change gears. In the store they told me that with this bike it would be really very intuitive and easy to figure out. I confirm! I'm having a great time and I love my new bike!",
		"Trying to find the right size bike for my petite wife was rather educational. REI (Englewood, CO) was very helpful in finding the right size. Problem being, there are only so many XXS MTB out there. The new CO-OP bikes are great, especially finding the right size. Build is solid, light and trail ready."
	]

	// Get a random review from the reviewsArray 
	var review = reviewsArray[Math.floor(Math.random() * reviewsArray.length)];
	var eSentiment = '';

	var s = new FormData();

	if (s) {
		s.append('document', review);
		s.append('modelId', 'CommunitySentiment');
	}

	// Use Einstein Sentiment to analyze the sentiment of the review
	$.ajax({
		url: 'https://api.einstein.ai/v2/language/sentiment',
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + bearer,
			'Cache-Control': 'no-cache'
		},
		data: s,
		processData: false,
		contentType: false,
		// Could use JS promise isntead of async:false to optimize.
		async: false,
		success: function (res) {
			// Convert probability to percentage
			var roundedProbability = Math.round(res.probabilities[0].probability * 1000) / 10;
			eSentiment += res.probabilities[0].label + " (" + roundedProbability.toString() + "%)";
		}

	})

	return eSentiment;
}



// THE FOLLOWING CODE IS NOT BEING USED IN THIS APPLICATION ANYMORE
// WANTED TO TRAIN THE MODEL FOR BEACH VS MOUNTAINS AND SUGGEST WHAT TO PACK
// LATER, REDUCED THE SCOPE. (WITHOUT TRAINING THE DATASETS)

//Einstein Intent to train the model and get appropriate content
function einsteinIntent(){

	//Einstein Intent upload file
	var intentData = new FormData();

	if (intentData) {
		intentData.append('path', 'https://drive.google.com/uc?export=download&id=14dhzMWgb-MQEYbyoIm3isb_unvJ3Lpya');
		intentData.append('type', 'text-intent');
	}

	// $.ajax({
	//         url: 'https://api.einstein.ai/v2/language/datasets/upload',
	//         method: 'POST',
	//         headers: {
	//           'Authorization':
	//             'Bearer '+bearer,
	//           'Cache-Control': 'no-cache'
	//         },
	//         data: intentData,
	//         processData: false,
	//         contentType: false
	//       }).done(function(res) {
	//         console.log(res);
	//       });


	//Einstein Intent TRAIN THE DATASET TO CREATE THE MODEL
	var trainData = new FormData();

	if (trainData) {
		trainData.append('name', 'Case Routing Model');
		trainData.append('datasetId', 1090185);
	}

	// $.ajax({
	//         url: 'https://api.einstein.ai/v2/language/train',
	//         method: 'POST',
	//         headers: {
	//           'Authorization':
	//             'Bearer '+bearer,
	//           'Cache-Control': 'no-cache'
	//         },
	//         data: trainData,
	//         processData: false,
	//         contentType: false
	//       }).done(function(res) {
	//         console.log(res);
	//       });


	//Einstein Intent SEND TEXT IN FOR PREDICTION
	var textData = new FormData();

	if (textData) {
		textData.append('document', 'I need to cancel my order');
		textData.append('modelId', "IL5Q2M26CYPEOHK53N76NA73TI");
	}

	// $.ajax({
	// 	url: 'https://api.einstein.ai/v2/language/intent',
	// 	method: 'POST',
	// 	headers: {
	// 		'Authorization': 'Bearer ' + bearer,
	// 		'Cache-Control': 'no-cache'
	// 	},
	// 	data: textData,
	// 	processData: false,
	// 	contentType: false
	// }).done(function (res) {
	// 	console.log(res);
	// });

}

