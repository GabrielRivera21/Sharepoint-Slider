/**
 * This JS File is currently not in use. If you want to reference an Image Library inside Host Web
 * replace App.js with this JS File.
 * Note: You will need List Read Permissions for the Image Library you want.
 */
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
var slider_interval

$(document).ready(function () {
    debugger;
    hostWebUrl = decodeURIComponent(getQueryStringParameter('SPHostUrl'));
    appWebUrl = decodeURIComponent(getQueryStringParameter('SPAppWebUrl'));
    libraryName = decodeURIComponent(getQueryStringParameter("ImageLibrary"));
    slider_interval = decodeURIComponent(getQueryStringParameter("SliderInterval"));
    //Adds the CSS style the User chooses
    var themeColorCss = decodeURIComponent(getQueryStringParameter("SliderColors"));
    $("head").append('<link rel="Stylesheet" type="text/css" href="../Content/' + themeColorCss + '.css" />');
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
        constructCarousel(enumerator);
        //Controls the Interval the Slider changes images.
        $('.carousel').carousel({
            interval: slider_interval
        })
        //Adjusts the iFrame
        adjustFrame();
    }
}

//Failure method  
function OnGetListItemFailure(sender, args) {
    console.log('Failed to get user name. Error:' + args.get_message());
}

//Constructs the Carousel holder if one item exists
function constructCarousel(enumerator) {
    debugger;

    //Creates the Carousel
    $("#slider-boot").append('<div id="myCarousel" class="carousel slide" data-ride="carousel"></div>');
    $("#myCarousel").append('<ol class="carousel-indicators"></ol>');
    
    //Creates the container for the Carousel Images
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

//Adds the Images to the Carousel by Viewing which images are active
function addImagesToCarousel(enumerator) {
    debugger;
    var i = 0; //index for indicator
    var ImageUrl;
    var ImageCaption;
    var ImageLink;

    while (enumerator.moveNext()) {
        var currentListItems = enumerator.get_current();
        var isActive = currentListItems.get_item("isActive");
        //get Image URL from current Item if it's active.
        if (isActive) {
            //Retrieves the URL, Caption and Link for each image item.
            ImageUrl = currentListItems.get_item("FileRef");
            ImageCaption = currentListItems.get_item("Caption");
            ImageLink = currentListItems.get_item("Links");

            //For use with the first indexed image being inserted
            var indicatorActive = "";
            var itemActive = "";

            //Container for caption
            var containerCaption = '<div class="container">' +
                                        '<div class="carousel-caption">' +
                                            '<p>' + ImageCaption + '</p>' +
                                        '</div>' +
                                   '</div>';

            //Links for the slider images.
            var hrefTagStart = '<a href="' + ImageLink + '" target="_blank">'
            var hrefTagEnd = "</a>";

            //If no caption was found, remove the caption container
            if (ImageCaption == null) {
                ImageCaption = "";
                containerCaption = "";
            }
            //If no ImageLink was found remove the tags for href
            if (ImageLink == null) {
                ImageLink = "";
                hrefTagStart = "";
                hrefTagEnd = "";
            }
            //If it's the first item being inserted it adds the active class
            if (i == 0) {
                indicatorActive = ' class="active"';
                itemActive = ' active';
            }

            //Creates the Carousel Indicator
            $(".carousel-indicators").append(
                '<li data-target="#myCarousel" data-slide-to="' + i++ + '"' + indicatorActive + '></li>');

            //Appends the Image to the slider with its caption
            $(".carousel-inner").append(
                 '<div class="item' + itemActive + '">' +
                      hrefTagStart +
                        '<img src="' + ImageUrl + '" alt="Hello"/>' +
                      hrefTagEnd +
                     containerCaption + 
                 '</div>');
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
                contentHeight = $("#slider-boot").height(),
                resizeMessage = '<message senderId={Sender_ID}>resize({Width}, {Height})</message>';

            newHeight = (step - (contentHeight % step)) + contentHeight;

            resizeMessage = resizeMessage.replace("{Sender_ID}", this.senderId);
            resizeMessage = resizeMessage.replace("{Height}", newHeight);
            resizeMessage = resizeMessage.replace("{Width}", "100%");

            window.parent.postMessage(resizeMessage, "*");
        }
    };

    Communica.Part.init();
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

//TODO: Implement this method
function createImageLibrary(hostWebUrl) {
    debugger;
    jQuery.ajax({
        url: "https:/_api/web/lists",
        type: "POST",
        data: JSON.stringify({
            '__metadata': { 'type': 'SP.List' }, 'AllowContentTypes': true,
            'BaseTemplate': 100, 'ContentTypesEnabled': true, 'Description': 'My list description', 'Title': 'Test'
        }
    ),
        headers: {
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: getLibraryFromUrl,
        error: OnGetListItemFailure
    });
}