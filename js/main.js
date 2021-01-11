$(document).ready(function() {
    function generateDataExport() {
        var exp = {
            'dataSource': {
                'gameVersion': gameTitle.split(' :: ')[1],
                'generationDate': (new Date()).toISOString()
            },
            'items': items,
            'monsters': MONSTERS,
            'thievingTargets': thievingNPC,
            'glovesCost': glovesCost,
            'dungeons': DUNGEONS,
            'altMagic': ALTMAGIC,
            'pets': PETS,
            'skills': SKILLS,
            'combatAreas': combatAreas,
            'slayerAreas': slayerAreas,
        }
        addSourcesToItems(exp);
        addZonesToMonsters(exp);
        fixPets(exp);
        return exp;
    }
    function fixPets(exp) {
        exp['pets'].forEach(function(pet, petID) {
            // Ty incorrectly associated with Woodcutting. Remove the association.
            if (exp['pets'][petID]['name'] == 'Ty') {
                if (exp['pets'][petID]['skill'] === 0) {
                    exp['pets'][petID]['skill'] = -1;
                }
            }
        });
    }
    function addZonesToMonsters(exp) {
        exp['combatAreas'].forEach(function(combatArea, combatAreaID) {
            combatArea['monsters'].forEach(function(monsterID) {
                if (!exp['monsters'][monsterID].hasOwnProperty('combatSources')) {
                    exp['monsters'][monsterID]['combatSources'] = []
                }
                if (exp['monsters'][monsterID]['combatSources'].indexOf(combatAreaID) === -1) {
                    // Add only if it doesn't exist already
                    exp['monsters'][monsterID]['combatSources'].push(combatAreaID);
                }
            });
        });
        exp['slayerAreas'].forEach(function(slayerArea, slayerAreaID) {
            slayerArea['monsters'].forEach(function(monsterID) {
                if (!exp['monsters'][monsterID].hasOwnProperty('slayerSources')) {
                    exp['monsters'][monsterID]['slayerSources'] = []
                }
                if (exp['monsters'][monsterID]['slayerSources'].indexOf(slayerAreaID) === -1) {
                    // Add only if it doesn't exist already
                    exp['monsters'][monsterID]['slayerSources'].push(slayerAreaID);
                }
            });
        });
        exp['dungeons'].forEach(function(dungeon, dungeonID) {
            dungeon['monsters'].forEach(function(monsterID) {
                if (!exp['monsters'][monsterID].hasOwnProperty('dungeonSources')) {
                    exp['monsters'][monsterID]['dungeonSources'] = []
                }
                if (exp['monsters'][monsterID]['dungeonSources'].indexOf(dungeonID) === -1) {
                    // Add only if it doesn't exist already
                    exp['monsters'][monsterID]['dungeonSources'].push(dungeonID);
                }
            });
        });
    }
    function addSourcesToItems(exp) {
        // Add Monster Drops To Item Array
        exp['monsters'].forEach(function(monster, monsterId) {
            if (monster.hasOwnProperty('lootTable')) {
                // Get the drop weight, add them together.
                var totalWeight = monster['lootTable'].map(x => x[1]).reduce((a, b) => a + b, 0) / ((monster['lootChance'] ?? 100) / 100);
                monster['lootTable'].forEach(function(drop) {
                    if (!exp['items'][drop[0]].hasOwnProperty('monsterSources')) {
                        exp['items'][drop[0]]['monsterSources'] = []
                    }
                    exp['items'][drop[0]]['monsterSources'].push({
                        "monster": monsterId,
                        "chance": fracReduce(drop[1], totalWeight),
                        "maxQty": drop[2]
                    });
                });
            }
            // Bones and Shards
            if (monster.hasOwnProperty('bones') && monster['bones'] != null) {
                if (!exp['items'][monster['bones']].hasOwnProperty('monsterSources')) {
                    exp['items'][monster['bones']]['monsterSources'] = []
                }
                exp['items'][monster['bones']]['monsterSources'].push({
                    "monster": monsterId,
                    "chance": [1, 1],
                    // Actual Quantity, or 1 by default
                    "maxQty": monster['boneQty'] ?? 1
                });
            }


        });
        // Add Herblore Level To Item Array
        herbloreItemData.forEach(function(herbloreData) {
            herbloreData['itemID'].forEach(function(itemID) {
                exp['items'][itemID]['herbloreLevel'] = herbloreData['herbloreLevel'];
            });
        });
        // Add Woodcutting Level To Item Array
        trees.forEach(function(tree, index) {
            var logName = tree['type'].charAt(0).toUpperCase() + tree['type'].slice(1) + " Logs"
            exp['items'].forEach(function(item) {
                if (item['name'] == logName) {
                    item['woodcuttingID'] = index
                    item['woodcuttingLevel'] = tree['level']
                }
            })
        });
        // Move Cooking Items From Raw to the Cooked counterpart
        exp['items'].forEach(function(item, itemID) {
            if (item.hasOwnProperty('cookedItemID')) {
                exp['items'][item['cookedItemID']]['cookingLevel'] = item['cookingLevel'];
                exp['items'][item['cookedItemID']]['cookingXP'] = item['cookingXP'];
                exp['items'][item['cookedItemID']]['cookingCategory'] = item['cookingCategory'];
                exp['items'][item['cookedItemID']]['cookingID'] = item['cookingID'];
                if (!exp['items'][item['cookedItemID']].hasOwnProperty('cookReq')) {
                    exp['items'][item['cookedItemID']]['cookReq'] = []
                }
                exp['items'][item['cookedItemID']]['cookReq'].push({ 'id': itemID, 'qty': 1 });
            }
            if (item.hasOwnProperty('burntItemID')) {
                exp['items'][item['burntItemID']]['cookingLevel'] = item['cookingLevel'];
                exp['items'][item['burntItemID']]['cookingXP'] = item['cookingXP'];
                exp['items'][item['burntItemID']]['cookingCategory'] = item['cookingCategory'];
                exp['items'][item['burntItemID']]['cookingID'] = item['cookingID'];
                if (!exp['items'][item['burntItemID']].hasOwnProperty('cookReq')) {
                    exp['items'][item['burntItemID']]['cookReq'] = []
                }
                exp['items'][item['burntItemID']]['cookReq'].push({ 'id': itemID, 'qty': 1 });
            }
        });
        // Clear Cooking attributes from the raw items (which are the only ones with cooked/burnt IDs)
        exp['items'].forEach(function(item, itemID) {
            if (item.hasOwnProperty('cookedItemID') || item.hasOwnProperty('burntItemID')) {
                delete item['cookingLevel'];
                delete item['cookingXP'];
                delete item['cookingCategory'];
                delete item['cookingID'];
                delete item['cookedItemID'];
                delete item['burntItemID'];
            }
        });
        // Move Farming Items From Seeds to the Grown counterpart
        exp['items'].forEach(function(item, itemID) {
            if (item.hasOwnProperty('grownItemID')) {
                exp['items'][item['grownItemID']]['farmingLevel'] = item['farmingLevel'];
                exp['items'][item['grownItemID']]['farmingXP'] = item['farmingXP'];
                exp['items'][item['grownItemID']]['timeToGrow'] = item['timeToGrow'];
                if (!exp['items'][item['grownItemID']].hasOwnProperty('farmReq')) {
                    exp['items'][item['grownItemID']]['farmReq'] = []
                }
                exp['items'][item['grownItemID']]['farmReq'].push({ 'id': itemID, 'qty': item['seedsRequired'] });
            }
        });
        // Clear Farming attributes from the seed items (which are the only ones with grown IDs)
        exp['items'].forEach(function(item, itemID) {
            if (item.hasOwnProperty('grownItemID')) {
                delete item['farmingLevel'];
                delete item['farmingXP'];
                delete item['timeToGrow'];
                delete item['grownItemID'];
            }
        });
        // Add Thieving Drops To Item Array
        thievingNPC.forEach(function(target, targetID) {
            if (target.hasOwnProperty('lootTable')) {
                // Get the drop weight, add them together.
                var totalWeight = target['lootTable'].map(x => x[1]).reduce((a, b) => a + b, 0);
                target['lootTable'].forEach(function(drop) {
                    if (!exp['items'][drop[0]].hasOwnProperty('thievingSources')) {
                        exp['items'][drop[0]]['thievingSources'] = []
                    }
                    exp['items'][drop[0]]['thievingSources'].push({
                        "target": targetID,
                        // Melvor Idle Wiki Bot lists it as: fracReduce(75 * drop[1], totalWeight),
                        "chance": fracReduce(drop[1] * 75, totalWeight * 100),
                        "maxQty": 1
                    });
                });
            }
        });
        // Add Openable Drops To Item Array
        exp['items'].forEach(function(item, itemID) {
            if (item.hasOwnProperty('canOpen')) {
                // Get the drop weight, add them together.
                var totalWeight = item['dropTable'].map(x => x[1]).reduce((a, b) => a + b, 0);
                item['dropTable'].forEach(function(drop, dropIdx) {
                    if (!exp['items'][drop[0]].hasOwnProperty('chestSources')) {
                        exp['items'][drop[0]]['chestSources'] = []
                    }
                    exp['items'][drop[0]]['chestSources'].push({
                        "chest": itemID,
                        // Melvor Idle Wiki Bot lists it as: fracReduce(75 * drop[1], totalWeight),
                        "chance": fracReduce(drop[1], totalWeight),
                        "qty": item['dropQty'][dropIdx]
                    });
                });
            }
        });
        // Add Dungeon Rewards To Item Array
        DUNGEONS.forEach(function(dungeon, dungeonID) {
            dungeon['rewards'].forEach(function(itemID) {
                // May be a false assumption but the data appears to indicate the final boss
                // drops the reward as well as the dungeon. But some dungeons drop items (Fire Cape)
                // that no bosses drop. For now assume that if a monster drops it it's not magically
                // given as a dungeon reward.
                if (!exp['items'][itemID].hasOwnProperty('monsterSources')) {
                    if (!exp['items'][itemID].hasOwnProperty('dungeonSources')) {
                        exp['items'][itemID]['dungeonSources'] = []
                    }
                    exp['items'][itemID]['dungeonSources'].push(dungeonID);
                }
            });
        });
        // Add Alt Magic Sources To Item Array
        // https://github.com/MelvorIdle/Melvor-Wiki-Bot/blob/master/sources/main.js#L1016
        ALTMAGIC.forEach(function(spell, spellID) {
            if (spell['selectItem'] == -1) {
                // Gems or ConvertTo Item
                if (spell.hasOwnProperty('convertTo')) {
                    // Convert To Item
                    if (!exp['items'][spell['convertTo']].hasOwnProperty('altMagicSources')) {
                        exp['items'][spell['convertTo']]['altMagicSources'] = []
                    }
                    exp['items'][spell['convertTo']]['altMagicSources'].push(spellID);
                } else {
                    // Create Gem
                    exp['items'].forEach(function(item, itemID) {
                        if (item['type'] == 'Gem') {
                            if (!exp['items'][itemID].hasOwnProperty('altMagicSources')) {
                                exp['items'][itemID]['altMagicSources'] = []
                            }
                            exp['items'][itemID]['altMagicSources'].push(spellID);
                        }
                    });
                }
            } else if (spell['selectItem'] == 0) {
                    // Create Bar
                    exp['items'].forEach(function(item, itemID) {
                        if (item['type'] == 'Bar') {
                            if (!exp['items'][itemID].hasOwnProperty('altMagicSources')) {
                                exp['items'][itemID]['altMagicSources'] = []
                            }
                            exp['items'][itemID]['altMagicSources'].push(spellID);
                        }
                    });
            } else if (spell['selectItem'] == 1) {
                if (spell.hasOwnProperty('isJunk') && spell['isJunk'] == true) {
                    // Create Gem
                    exp['items'].forEach(function(item, itemID) {
                        if (item['type'] == 'Gem') {
                            if (!exp['items'][itemID].hasOwnProperty('altMagicSources')) {
                                exp['items'][itemID]['altMagicSources'] = []
                            }
                            exp['items'][itemID]['altMagicSources'].push(spellID);
                        }
                    });
                } else if (!spell.hasOwnProperty('isAlch') && spell['isAlch'] == false) {
                    // Convert To Item
                    if (!exp['items'][spell['convertTo']].hasOwnProperty('altMagicSources')) {
                        exp['items'][spell['convertTo']]['altMagicSources'] = []
                    }
                    exp['items'][spell['convertTo']]['altMagicSources'].push(spellID);
                }
            }
        });
    }
    function fracReduce(numerator,denominator){
        // https://stackoverflow.com/a/4652513/606974
        var gcd = function gcd(a,b){
          return b ? gcd(b, a%b) : a;
        };
        gcd = gcd(numerator,denominator);
        return [numerator/gcd, denominator/gcd];
    }





    function generateDownloadCommands() {
        var returnStr = ''
        items.forEach(function(resource){
            // Use this if we want to ignore ?### at the end. But you'd have to change other media references...
            //returnStr += 'curl ' + CDNDIR + resource.media + ' --create-dirs -o data_export/' + resource.media.split('?')[0] + "\n";
            returnStr += 'curl ' + CDNDIR + resource.media + ' --create-dirs -o data_export/' + resource.media + "\n";
        });
        MONSTERS.forEach(function(resource){
            returnStr += 'curl ' + CDNDIR + resource.media + ' --create-dirs -o data_export/' + resource.media + "\n";
        });
        return returnStr;
    }
    //$('#downloadCommands').val(generateDownloadCommands());
    var exp = generateDataExport();
    $('#dataExport').val('var melvorData = ' + JSON.stringify(exp, null, 4));
    $('#dataExportMinified').val('var melvorData = ' + JSON.stringify(exp));
    //generateDataExport()
});