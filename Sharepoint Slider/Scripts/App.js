var libraryName = "ImageLibrary";
var hostWebUrl;
var appWebUrl;
var ctx;
var appCtxSite;
var web;
var libraries;
var listEnumerator;
var currentlibrary;
var library;

$(document).ready(function () {
    hostWebUrl = decodeURIComponent(getQueryStringParameter('SPHostUrl'));
    appWebUrl = decodeURIComponent(getQueryStringParameter('SPAppWebUrl'));
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
    while (listEnumerator.moveNext() && !isListAvail) {
        currentlibrary = listEnumerator.get_current();
        //check whether the library name is equal to current library   
        if (currentlibrary.get_title() == libraryName) {
            isListAvail = true;
            //Retrieve list items from the lists  
            getListItemCollection();
        }
    }
    if (!isListAvail) {
        alert('News Library is not available in this site');
    }

}

//Get image collection from Library  
function getListItemCollection() {
    debugger;
    //Get the library by Title  
    library = libraries.getByTitle(libraryName);
    //get two items on library using caml Query  
    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml("<View>" + "<RowLimit>5</RowLimit>" + "</View>");
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
    var imageStr = "";
    var ImageUrl;
    //get_count() is used to get the items from current library  
    if (itemCollection.get_count() > 0) {
        var enumerator = itemCollection.getEnumerator();
        enumerator.moveNext();
        constructCarousel(itemCollection.get_count(), enumerator.get_current());
        while (enumerator.moveNext()) {
            var currentListItems = enumerator.get_current();
            //get Image Name from current Item  
            ImageUrl = currentListItems.get_item("FileRef");
            $(".carousel-inner").append(
                '<div class="item">' +
                    '<img src="' + ImageUrl + '" alt="Hello"/>' +
                '</div>');
                
        }
        $('.carousel').carousel({
            interval: 3000
        })
    }
}

//Failure method  
function OnGetListItemFailure(sender, args) {
    alert('Failed to get user name. Error:' + args.get_message());
}

//Constructs the Carousel holder if one item exists
function constructCarousel(itemNum, firstItem) {
    debugger;
    //Creates the Carousel
    $("#slider-boot").append('<div id="myCarousel" class="carousel slide" data-ride="carousel"></div>');
    $("#myCarousel").append('<ol class="carousel-indicators"></ol>');

    //Creates the Carousel Indicator
    $(".carousel-indicators").append('<li data-target="#myCarousel" data-slide-to="0" class="active"></li>');
    for(var i = 1; i < itemNum; i++){
        $(".carousel-indicators").append('<li data-target="#myCarousel" data-slide-to="' + i + '"></li>');
    }
    //Creates the first item into the carousel
    $("#myCarousel").append('<div class="carousel-inner" role="listbox"></div>');
    $(".carousel-inner").append('<div class="item active">' +
        '<img src="' + firstItem.get_item("FileRef") + '" alt="Hello"/>' +
        '</div>');

    //Creates the prev & next button of the Carousel
    $("#myCarousel").append(
        '<a class="left carousel-control" href="#myCarousel" role="button" data-slide="prev">' +
        '<span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>' +
        '<span class="sr-only">Previous</span></a>');
    $("#myCarousel").append(
        '<a class="right carousel-control" href="#myCarousel" role="button" data-slide="next">' +
        '<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>' +
        '<span class="sr-only">Next</span></a>');
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