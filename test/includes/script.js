(function(){
    var doc = document;
    var tabClass = "demotab";
    var tabCurrent = tabClass + "--current";
    var itemClass = "demoitem";
    var itemCurrent = itemClass + "--current";

    var tabs = doc.querySelectorAll("." + tabClass);
    var Items = doc.querySelectorAll("." + itemClass);

    var currentTabElem = tabs[0];
    var currentItemElem = Items[0];

    currentTabElem.classList.add(tabCurrent);
    currentItemElem.classList.add(itemCurrent);

    for (var i = 0; i < tabs.length; i++) {
        var tab = tabs[i];
        tab.onclick = function(event) {
            var showElem = this.getAttribute("data-show");

            currentTabElem.classList.remove(tabCurrent);
            currentItemElem.classList.remove(itemCurrent);

            this.classList.add(tabCurrent);
            currentTabElem = this;

            currentItemElem = doc.querySelector("." + showElem);
            currentItemElem.classList.add(itemCurrent);;
        };
    }

    function out(content) {
        console.log(content);
    }
})();