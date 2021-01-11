$(document).ready(function() {
    // On Load Code
    CDNPrefix = 'https://cdn.melvor.net/core/v018/';
    $('#gameDataVersion').text(melvorData['dataSource']['gameVersion']);
    $('#gameDataGenerationDate').text(melvorData['dataSource']['generationDate']);
    // Functions
    function getMissingItemIDs(itemStats) {
        var missingIDs = Object.keys(melvorData['items']);
        itemStats.forEach(function(item) {
            if (item.stats[0] > 0) {
                missingIDs = missingIDs.filter(id => id != item['itemID']);
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
        monsterName = melvorData['monsters'][monsterID]['name'];
        articleName = monsterName.replace('#', '');
        return (image?'<img src="' + CDNPrefix + melvorData['monsters'][monsterID]['media'] + '" />':'') + '<a href="https://wiki.melvoridle.com/index.php?title=' + articleName + '" target="_new">' + (brackets?'[':'') + monsterName + (brackets?']':'') + '</a>';
    }
    function targetLink(targetID, brackets = false, image = false) {
        targetName = melvorData['thievingTargets'][targetID]['name'];
        articleName = targetName.replace('#', '');
        return (image?'<img src="' + CDNPrefix + melvorData['thievingTargets'][targetID]['media'] + '" />':'') + '<a href="https://wiki.melvoridle.com/index.php?title=' + articleName + '" target="_new">' + (brackets?'[':'') + targetName + (brackets?']':'') + '</a>';
    }
    function goldCoinsLink(brackets = false, image = false) {
        return (image?'<img src="' + CDNPrefix + 'assets/media/main/coins.svg" />':'') + '<a href="https://wiki.melvoridle.com/index.php?title=Currency" target="_new">' + (brackets?'[':'') + 'Coins' + (brackets?']':'') + '</a>';
    }
    function slayerCoinsLink(brackets = false, image = false) {
        return (image?'<img src="' + CDNPrefix + 'assets/media/main/slayer_coins.svg" />':'') + '<a href="https://wiki.melvoridle.com/index.php?title=Currency" target="_new">' + (brackets?'[':'') + 'Slayer Coins' + (brackets?']':'') + '</a>';
    }
    function dungeonLink(dungeonID, brackets = false, image = false) {
        dungeonName = melvorData['dungeons'][dungeonID]['name'];
        articleName = dungeonName.replace('#', '');
        // This may be a bug, but the Dungeon asset data has the CDN prefix already specified
        return (image?'<img src="' + melvorData['dungeons'][dungeonID]['media'] + '" />':'') + '<a href="https://wiki.melvoridle.com/index.php?title=' + articleName + '" target="_new">' + (brackets?'[':'') + dungeonName + (brackets?']':'') + '</a>';
    }
    function spellLink(spellID, brackets = false, image = false) {
        spellName = melvorData['altMagic'][spellID]['name'];
        articleName = spellName.replace('#', '');
        return (image?'<img src="' + CDNPrefix + melvorData['altMagic'][spellID]['media'] + '" />':'') + '<a href="https://wiki.melvoridle.com/index.php?title=' + articleName + '" target="_new">' + (brackets?'[':'') + spellName + (brackets?']':'') + '</a>';
    }



    function generateSourceString(itemID) {
        sourceStr = ''
        // Add Skill Sources
        var skillMap = {
            'Crafting': 'craftReq',
            'Fletching': 'fletchReq',
            'Herblore': 'herbloreReq',
            'Runecrafting': 'runecraftReq',
            'Smithing': 'smithReq',
            'Woodcutting': '',
            'Mining': '',
            'Fishing': '',
            'Cooking': 'cookReq',
            'Farming': 'farmReq'
        }
        Object.keys(skillMap).forEach(function(propKey) {
            var propLevelKey = propKey.toLowerCase() + 'Level';
            var propReqKey = skillMap[propKey];
            if (melvorData['items'][itemID].hasOwnProperty(propLevelKey)) {
                if (sourceStr != '') { sourceStr += '<br/>'; }
                sourceStr += propKey + ' (Level ' + melvorData['items'][itemID][propLevelKey] + ')';
                if (propReqKey != '') {
                    sourceStr += ':<br />';
                    skillStrs = []
                    melvorData['items'][itemID][propReqKey].forEach(function(skillSource) {
                        skillStrs.push(itemLink(skillSource['id'], false, true) + ' x ' + skillSource['qty'].toLocaleString())
                    });
                    sourceStr += skillStrs.join('<br/>')
                }
            }
        });
        // Add Fishing Junk / Special Sources
        if (melvorData['items'][itemID]['category'] == 'Fishing') {
            if (melvorData['items'][itemID]['type'] == 'Junk' || melvorData['items'][itemID]['type'] == 'Special') {
                if (sourceStr != '') { sourceStr += '<br/>'; }
                sourceStr += 'Fishing ' + melvorData['items'][itemID]['type'] + ' (Level 1)';
            }
        }
        // Add non-fishing items that can be caught via fishing
        if (melvorData['items'][itemID].hasOwnProperty('fishingCatchWeight') && melvorData['items'][itemID]['category'] != 'Fishing') {
            if (sourceStr != '') { sourceStr += '<br/>'; }
            sourceStr += 'Fishing Special (Level 1)';
        }
        // Add Upgrade Sources
        if (melvorData['items'][itemID].hasOwnProperty('itemsRequired')) {
            if (sourceStr != '') { sourceStr += '<br/>'; }
            sourceStr += 'Upgrade:<br />';
            itemStrs = []
            melvorData['items'][itemID]['itemsRequired'].forEach(function(reqs) {
                itemStrs.push(itemLink(reqs[0], false, true) + ' x ' + reqs[1].toLocaleString())
            });
            sourceStr += itemStrs.join('<br/>')
        }
        // TODO: Should probably refactor Combat/Thieving/Chests since they're super similar
        // Add Combat Sources
        if (melvorData['items'][itemID].hasOwnProperty('monsterSources')) {
            if (sourceStr != '') { sourceStr += '<br/>'; }
            sourceStr += 'Monsters:<br />';
            monsterStrs = []
            melvorData['items'][itemID]['monsterSources'].forEach(function(monsterSource) {
                var pctChance = (monsterSource['chance'][0]/monsterSource['chance'][1]*100).toFixed(2)
                // Format string as "<Drop Chance><Icon> (<Drop Fraction> - <Drop Percent>)"
                // The first <Drop Chance> will be used to sort but then trimmed from final display.
                monsterStrs.push((pctChance * 100).toFixed(0).padStart(5, '0') + monsterLink(monsterSource['monster'], false, true) + ' (' + monsterSource['chance'][0] + '/' + monsterSource['chance'][1] + ' - ' + pctChance + '%)')
            });
            // Sort by highest droprate
            monsterStrs.sort();
            monsterStrs.reverse();
            // Trim the drop chance prefix used for sorting
            monsterStrs = monsterStrs.map(function(monsterStr) {
                return monsterStr.substring(5);
            });
            sourceStr += monsterStrs.join('<br/>')
        }
        // Add Thieving Sources
        if (melvorData['items'][itemID].hasOwnProperty('thievingSources')) {
            if (sourceStr != '') { sourceStr += '<br/>'; }
            // This section is OK for now because CURRENTLY you can't get an item from
            // two Thieving sources. If this changes will have to change this section.
            var targetSource = melvorData['items'][itemID]['thievingSources'][0];
            sourceStr += 'Thieving (Level ' + melvorData['thievingTargets'][targetSource['target']]['level'] + '):<br />';
            var pctChance = (targetSource['chance'][0]/targetSource['chance'][1]*100).toFixed(2)
            // Format string as "<Drop Chance><Icon> (<Drop Fraction> - <Drop Percent>)"
            // The first <Drop Chance> will be used to sort but then trimmed from final display.
            sourceStr += targetLink(targetSource['target'], false, true) + ' (' + targetSource['chance'][0] + '/' + targetSource['chance'][1] + ' - ' + pctChance + '%)'
        }
        // Add Chest Sources
        if (melvorData['items'][itemID].hasOwnProperty('chestSources')) {
            if (sourceStr != '') { sourceStr += '<br/>'; }
            sourceStr += 'Chests:<br />';
            chestStrs = []
            melvorData['items'][itemID]['chestSources'].forEach(function(chestSource) {
                var pctChance = (chestSource['chance'][0]/chestSource['chance'][1]*100).toFixed(2)
                // Format string as "<Drop Chance><Icon> (<Drop Fraction> - <Drop Percent>)"
                // The first <Drop Chance> will be used to sort but then trimmed from final display.
                chestStrs.push((pctChance * 100).toFixed(0).padStart(5, '0') + itemLink(chestSource['chest'], false, true) + ' (' + chestSource['chance'][0] + '/' + chestSource['chance'][1] + ' - ' + pctChance + '%)')
            });
            // Sort by highest droprate
            chestStrs.sort();
            chestStrs.reverse();
            // Trim the drop chance prefix used for sorting
            chestStrs = chestStrs.map(function(chestStr) {
                return chestStr.substring(5);
            });
            sourceStr += chestStrs.join('<br/>')
        }
        // Add Shop Sources
        if (melvorData['items'][itemID].hasOwnProperty('buysFor') || melvorData['items'][itemID].hasOwnProperty('slayerCost') || melvorData['items'][itemID].hasOwnProperty('buysForItems') || melvorData['items'][itemID].hasOwnProperty('gloveID')) {
            if (sourceStr != '') { sourceStr += '<br/>'; }
            sourceStr += 'Shop:<br />';
            shopStrs = []
            if (melvorData['items'][itemID].hasOwnProperty('buysFor') && melvorData['items'][itemID]['buysFor'] > 0) {
                shopStrs.push(goldCoinsLink(false, true) + ' x ' + melvorData['items'][itemID]['buysFor'].toLocaleString())
            }
            if (melvorData['items'][itemID].hasOwnProperty('slayerCost')) {
                shopStrs.push(slayerCoinsLink(false, true) + ' x ' + melvorData['items'][itemID]['slayerCost'].toLocaleString())
            }
            if (melvorData['items'][itemID].hasOwnProperty('buysForItems')) {
                melvorData['items'][itemID]['buysForItems'].forEach(function(material) {
                    shopStrs.push(itemLink(material[0], false, true) + ' x ' + material[1].toLocaleString())
                });
            }
            if (melvorData['items'][itemID].hasOwnProperty('gloveID')) {
                shopStrs.push(goldCoinsLink(false, true) + ' x ' + melvorData['glovesCost'][melvorData['items'][itemID]['gloveID']].toLocaleString())
            }


            sourceStr += shopStrs.join('<br/>')
        }
        // Add Dungeon Sources - https://github.com/MelvorIdle/Melvor-Wiki-Bot/blob/master/sources/main.js#L1300
        if (melvorData['items'][itemID].hasOwnProperty('dungeonSources')) {
            if (sourceStr != '') { sourceStr += '<br/>'; }
            sourceStr += 'Dungeons:<br />';
            dungeonStrs = []
            melvorData['items'][itemID]['dungeonSources'].forEach(function(dungeonID) {
                dungeonStrs.push(dungeonLink(dungeonID, false, true))
            });
            sourceStr += dungeonStrs.join('<br/>')
        }
        // Add Alt Magic Sources
        if (melvorData['items'][itemID].hasOwnProperty('altMagicSources')) {
            if (sourceStr != '') { sourceStr += '<br/>'; }
            sourceStr += 'Alt Magic:<br />';
            magicStrs = []
            melvorData['items'][itemID]['altMagicSources'].forEach(function(spellID) {
                magicStrs.push(spellLink(spellID, false, true))
            });
            sourceStr += magicStrs.join('<br/>')
        }
        // Add Token Sources
        if (melvorData['items'][itemID].hasOwnProperty('isToken') && melvorData['items'][itemID]['isToken'] == true) {
            if (sourceStr != '') { sourceStr += '<br/>'; }
            sourceStr += melvorData['items'][itemID]['name'].replace('Mastery Token (', '').replace(')', '') + ' (Level 1)';
        }
        if (sourceStr == '') {
            sourceStr = 'Unknown Source - Will Be Added Soon!'
        }
        return sourceStr;
    }

    // Events
    $('#saveImport').on('blur', () => {
        var saveJSON = loadSaveData();
        if (!saveJSON) {
            // Hide and and reset tables
            $('#missingWrapper').addClass('d-none');
            resetMissingTables();
        } else {
            missingItemIDs = getMissingItemIDs(saveJSON['itemStats']);
            // Clear all entries
            resetMissingTables();
            missingItemIDs.forEach(function(itemID) {
                $('#tableItems tbody tr:last').after('<tr><td>' + itemID + '</td><td>' + itemLink(itemID, false, true) + '</td><td class="item-source">' + generateSourceString(itemID) + '</td></tr>');
            });
            // Show tables
            $('#missingWrapper').removeClass('d-none');
        }
    });
    $('#filter').on('input', function(){
        // https://stackoverflow.com/a/41554434/606974
        // https://schier.co/blog/wait-for-user-to-stop-typing-using-javascript
        var selection = $(this).val().toLowerCase();
        var timer;
        clearTimeout(timer);
        if (selection.length == 0) {
            // If empty recognize empty search immediately
            runFilter(selection);
        } else {
            // Wait for 1s pause to filter when there is content
            timer =	setTimeout(function () {
                runFilter(selection);
            }, 1000);
        }
    });
    function runFilter(selection) {
        $('#missingWrapper table').show();
        var dataset = $('#missingWrapper table tbody').find('tr');
        // show all rows first
        dataset.show();
        // filter the rows that should be hidden
        dataset.filter(function(index, item) {
            return $(item).find('td').text().toLowerCase().indexOf(selection) === -1;
        }).hide();
    }
    function resetMissingTables() {
        $('#tableItems tbody').val('<tr style="display:none"></tr>');
    }
    function loadSaveData() {
        // Quit if blank save
        if (!$('#saveImport').val()) {
            $('#saveLoadAlert').text('');
            $('#saveLoadAlert').addClass('d-none');
            return false;
        }
        // Quit if corrupt save (unable to un-base64 and un-gzip).
        try {
            // https://stackoverflow.com/a/41106346/606974
            saveJSON = JSON.parse(pako.ungzip(Uint8Array.from(atob($('#saveImport').val()), c => c.charCodeAt(0)), { to: 'string' }));
        }
        catch(err) {
            $('#saveLoadAlert').html('<span style="font-weight:bold">Save data corrupt!</span><br/>Did you accidentally add any text to the save data? Steps for retreiving sava data are found by clicking the <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-question-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/></svg> icon above.');
            $('#saveLoadAlert').removeClass('d-none');
            return false;
        }
        // Quit if it's not a Melvor Idle save
        if (!saveJSON.hasOwnProperty('accountGameVersion')) {
            $('#saveLoadAlert').html('<span style="font-weight:bold">Not a Melvor Idle Save!</span><br/>The save data was decoded but does not appear to contain Melvor Idle save data. Steps for retreiving sava data are found by clicking the <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-question-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/></svg> icon above.');
            $('#saveLoadAlert').removeClass('d-none');
            return false;
        }
        // Quit if it's an older game version
        if (saveJSON['accountGameVersion'] < 121) {
            // Not sure what 121 signifies, but I assume this is the right
            // variable to use for game compatibility checking.
            $('#saveLoadAlert').html('<span style="font-weight:bold">Save From Old Game Version!</span><br/>The save data appears to be from an older version of Melvor Idle. Please try refreshing or restarting your Melvor Idle app or browser window and generate a new save data export.');
            $('#saveLoadAlert').removeClass('d-none');
            return false;
        }
        // Save is valid, so hide any alerts
        $('#saveLoadAlert').text('');
        $('#saveLoadAlert').addClass('d-none');
        // Convert Nulls to prevent errors
        saveJSON['itemStats'] = saveJSON['itemStats'] ?? [];
        return saveJSON;
    }
});