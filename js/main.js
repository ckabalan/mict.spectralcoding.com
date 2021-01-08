$(document).ready(function() {
    // On Load Code
    CDNPrefix = 'https://cdn.melvor.net/core/v018/';
    // Functions
    function getMissingItemIDs(itemStats) {
        missingIDs = [];
        itemStats.forEach(function(item) {
            if (item.stats[0] == 0) {
                missingIDs.push(item.itemID);
            }
        });
        return missingIDs;
    }
    function itemLink(itemID, brackets = false, image = false) {
        itemName = melvorData['items'][itemID]['name'];
        articleName = itemName.replace('#', '');
        return (image?'<img src="' + CDNPrefix + melvorData['items'][itemID]['media'] + '" />':'') + '<a href="https://wiki.melvoridle.com/index.php?title=' + articleName + '" target="_new">' + (brackets?'[':'') + itemName + (brackets?']':'') + '</a>';
    }
    function monsterLink(monsterID, brackets = false, image = false) {
        itemName = melvorData['monsters'][monsterID]['name'];
        articleName = itemName.replace('#', '');
        return (image?'<img src="' + CDNPrefix + melvorData['monsters'][monsterID]['media'] + '" />':'') + '<a href="https://wiki.melvoridle.com/index.php?title=' + articleName + '" target="_new">' + (brackets?'[':'') + itemName + (brackets?']':'') + '</a>';
    }

    function generateSourceString(itemID) {
        sourceStr = ''
        // Add Upgrade Sources
        if (melvorData['items'][itemID].hasOwnProperty('itemsRequired')) {
            sourceStr += 'Upgrade:<br />';
            itemStrs = []
            melvorData['items'][itemID]['itemsRequired'].forEach(function(reqs) {
                itemStrs.push(itemLink(reqs[0], false, true) + ' x ' + reqs[1])
            });
            sourceStr += itemStrs.join('<br/>')
        }
        // Add Combat Sources
        if (melvorData['items'][itemID].hasOwnProperty('monsterSources')) {
            if (sourceStr != '') { sourceStr += '<br/>'; }
            sourceStr += 'Monsters:<br />';
            monsterStrs = []
            melvorData['items'][itemID]['monsterSources'].forEach(function(monsterSource) {
                monsterStrs.push(monsterLink(monsterSource['monster'], false, true) + ' (' + monsterSource['chance'][0] + '/' + monsterSource['chance'][1] + ')')
            });
            sourceStr += monsterStrs.join('<br/>')
        }
        // Add Skill Sources
        var skillMap = {
            "craftReq": "Crafting",
            "fletchReq": "Fletching",
            "herbloreReq": "Herblore",
            "runecraftReq": "Runecrafting",
            "smithReq": "Smithing"
        }
        Object.keys(skillMap).forEach(function(propKey) {
            if (melvorData['items'][itemID].hasOwnProperty(propKey)) {
                if (sourceStr != '') { sourceStr += '<br/>'; }
                sourceStr += skillMap[propKey] + ' (Level ' + melvorData['items'][itemID][skillMap[propKey].toLowerCase() + 'Level'] + '):<br />';
                skillStrs = []
                melvorData['items'][itemID][propKey].forEach(function(skillSource) {
                    skillStrs.push(itemLink(skillSource['id'], false, true) + ' x ' + skillSource['qty'])
                });
                sourceStr += skillStrs.join('<br/>')
            }
        });
        return sourceStr;
    }

    // Events
    $('#saveImport').on('blur', () => {
        // https://stackoverflow.com/a/41106346/606974
        saveJSON = JSON.parse(pako.ungzip(Uint8Array.from(atob($('#saveImport').val()), c => c.charCodeAt(0)), { to: 'string' }));
        //saveData = JSON.stringify(saveJSON, null, 2);
        missingItemIDs = getMissingItemIDs(saveJSON.itemStats);
        missingItemIDs.forEach(function(itemID) {
            $('#tableItems tr:last').after('<tr><td>' + itemID + '</td><td>' + itemLink(itemID, false, true) + '</td><td class="item-source">' + generateSourceString(itemID) + '</td></tr>');
        });
        $('#missingAccordion').removeClass('d-none');
    });
});