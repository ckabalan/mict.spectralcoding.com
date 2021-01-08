$(document).ready(function() {
    // On Load Code
    CDNPrefix = 'https://cdn.melvor.net/core/v018/';
    // Functions
    function getMissingItemIDs(itemStats) {
        console.log(itemStats);
        missingIDs = [];
        itemStats.forEach(function(item) {
            if (item.stats[0] == 0) {
                missingIDs.push(item.itemID);
            }
        });
        return missingIDs;
    }
    function itemLink(itemID, brackets = false, image = false) {
        itemName = items[itemID].name;
        articleName = itemName.replace('#', '');
        return (brackets?'<img src="' + CDNPrefix + items[itemID].media + '" />':'') + '<a href="https://wiki.melvoridle.com/index.php?title=' + articleName + '" target="_new">' + (brackets?'[':'') + itemName + (brackets?']':'') + '</a>';
    }

    function generateSourceString(itemID) {
        sourceStr = items[itemID].category;
        if (items[itemID].hasOwnProperty('itemsRequired')) {
            itemStrs = []
            items[itemID].itemsRequired.forEach(function(reqs) {
                itemStrs.push(itemLink(reqs[0], true) + ' x ' + reqs[1])
            });
            sourceStr = itemStrs.join('<br/>')
        }
        return sourceStr;
    }

    // Events
    $('#saveImport').on('blur', () => {
        // https://stackoverflow.com/a/41106346/606974
        saveJSON = JSON.parse(pako.ungzip(Uint8Array.from(atob($('#saveImport').val()), c => c.charCodeAt(0)), { to: 'string' }));
        //saveData = JSON.stringify(saveJSON, null, 2);
        missingItemIDs = getMissingItemIDs(saveJSON.itemStats);
        console.log(missingItemIDs);
        missingItemIDs.forEach(function(itemID) {
            console.log(items[itemID]);
            $('#tableItems tr:last').after('<tr><td>' + itemID + '</td><td>' + itemLink(itemID) + '</td><td>' + generateSourceString(itemID) + '</td></tr>');
        });
        $('#missingAccordion').removeClass('d-none');
    });
});