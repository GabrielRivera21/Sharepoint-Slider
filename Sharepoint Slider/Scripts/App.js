var libraryName;
var hostWebUrl;
var appWebUrl;
var ctx;
var appCtxSite;
var web;
var libraries;
var listEnumerator;
var currentlibrary;
var library;

//Slider Properties Changes
var slider_height;
var slider_width;
var slider_interval

$(document).ready(function () {
    hostWebUrl = decodeURIComponent(getQueryStringParameter('SPHostUrl'));
    appWebUrl = decodeURIComponent(getQueryStringParameter('SPAppWebUrl'));
    libraryName = decodeURIComponent(getQueryStringParameter("ImageLibrary"));
    slider_height = decodeURIComponent(getQueryStringParameter("SliderHeight"));
    slider_width = decodeURIComponent(getQueryStringParameter("SliderWidth"));
    slider_interval = decodeURIComponent(getQueryStringParameter("SliderInterval"));
    getLibraryFromUrl();
});

function getLibraryFromUrl() {
    ctx = new SP.ClientContext(appWebUrl);
    appCtxSite = new SP.AppContextSite(ctx, hostWebUrl);
    web = appCtxSite.get_web();
    libraries = web.get_lists();
    ctx.load(libraries);
    ctx.executeQueryAsync(IsListExist, OnGetListItemFailure);
}

function IsListExist() {
    debugger;
    //alert('check whether list is exist or not');  
    var isListAvail = false;
    listEnumerator = libraries.getEnumerator();
    while (listEnumerator.moveNext() && !isListAvail && libraryName != "") {
        currentlibrary = listEnumerator.get_current();
        //check whether the library name is equal to current library   
        if (currentlibrary.get_title() == libraryName) {
            isListAvail = true;
            //Retrieve list items from the lists  
            getListItemCollection();
        }
    }
    if (!isListAvail && libraryName != "") {
        alert('Please select a Library that is in your site. You can select this at Slider Properties.');
    }

}

//Get image collection from Library  
function getListItemCollection() {
    debugger;
    //Get the library by Title  
    library = libraries.getByTitle(libraryName);
    //get two items on library using caml Query  
    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml("<View>" + "" + "</View>");
    //returns the item collectionbased on the query.  
    // “getItems” is one of the method that is used to retrieve the items from the list using the listitem object. 
    //This method specifies which items to return.  
    itemCollection = library.getItems(camlQuery);
    ctx.load(itemCollection);
    ctx.executeQueryAsync(OnGetListItemSuccess, OnGetListItemFailure);
}

//Get Image URL from Library  
function OnGetListItemSuccess() {
    debugger;
    //get_count() is used to get the items from current library  
    if (itemCollection.get_count() > 0) {
        var enumerator = itemCollection.getEnumerator();
        //Constructs the Carousel
        constructCarousel(itemCollection.get_count(), enumerator);
        $('.carousel').carousel({
            interval: slider_interval
        })
        adjustFrame();
    }
}

//Failure method  
function OnGetListItemFailure(sender, args) {
    alert('Failed to get user name. Error:' + args.get_message());
}

//Constructs the Carousel holder if one item exists
function constructCarousel(itemNum, enumerator) {
    debugger;
    //Creates the Carousel
    $("#slider-boot").append('<div id="myCarousel" class="carousel slide" data-ride="carousel"></div>');
    $("#myCarousel").append('<ol class="carousel-indicators"></ol>');
    
    //Creates the first item into the carousel
    $("#myCarousel").append('<div class="carousel-inner" role="listbox"></div>');

    //Creates the prev & next button of the Carousel
    $("#myCarousel").append(
        '<a class="left carousel-control" href="#myCarousel" role="button" data-slide="prev">' +
        '<span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>' +
        '<span class="sr-only">Previous</span></a>');
    $("#myCarousel").append(
        '<a class="right carousel-control" href="#myCarousel" role="button" data-slide="next">' +
        '<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>' +
        '<span class="sr-only">Next</span></a>');

    addImagesToCarousel(enumerator);
}

// Function to retrieve a query string value.
// For production purposes you may want to use
// a library to handle the query string.
function getQueryStringParameter(paramToRetrieve) {
    var params =
        document.URL.split("?")[1].split("&");
    var strParams = "";
    for (var i = 0; i < params.length; i = i + 1) {
        var singleParam = params[i].split("=");
        if (singleParam[0] == paramToRetrieve)
            return singleParam[1];
    }
}

//Adds the Images to the Carousel by Viewing which images are active
function addImagesToCarousel(enumerator) {
    var i = 0;
    var ImageUrl;
    while (enumerator.moveNext()) {
        var currentListItems = enumerator.get_current();
        var isActive = currentListItems.get_item("isActive");
        //get Image URL from current Item if it's active.
        if (isActive) {
            if (i == 0) {
                //Creates the Carousel Indicator
                $(".carousel-indicators").append('<li data-target="#myCarousel" data-slide-to="0" class="active"></li>');
                ImageUrl = currentListItems.get_item("FileRef");
                $(".carousel-inner").append(
                '<div class="item active">' +
                    '<img src="' + ImageUrl + '" alt="Hello"/>' +
                '</div>');
                i = i + 1;
            } else {
                $(".carousel-indicators").append('<li data-target="#myCarousel" data-slide-to="' + i++ + '"></li>');
                ImageUrl = currentListItems.get_item("FileRef");
                $(".carousel-inner").append(
                    '<div class="item">' +
                        '<img src="' + ImageUrl + '" alt="Hello"/>' +
                    '</div>');
            }
        }

    }
}

function adjustFrame() {
    window.Communica = window.Communica || {};

    Communica.Part = {
        senderId: '',

        init: function () {
            var params = document.URL.split("?")[1].split("&");
            for (var i = 0; i < params.length; i = i + 1) {
                var param = params[i].split("=");
                if (param[0].toLowerCase() == "senderid")
                    this.senderId = decodeURIComponent(param[1]);
            }


            this.adjustSize();
        },

        adjustSize: function () {
            var step = 30,
                newHeight,
                contentHeight = $('#userDataContent').height(),
                resizeMessage = '<message senderId={Sender_ID}>resize({Width}, {Height})</message>';

            newHeight = (step - (contentHeight % step)) + contentHeight;

            resizeMessage = resizeMessage.replace("{Sender_ID}", this.senderId);
            resizeMessage = resizeMessage.replace("{Height}", slider_height);
            resizeMessage = resizeMessage.replace("{Width}", slider_width);

            window.parent.postMessage(resizeMessage, "*");
        }
    };

    Communica.Part.init();
}