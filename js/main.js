$(document).ready(function() {
    function generateDataExport() {
        var exp = {
            'items': items,
            'monsters': MONSTERS
        }
        addSourcesToItems(exp);
        console.log(exp);
        return JSON.stringify(exp, null, 4);
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
        });
        // Add Herblore Level To Item Array
        herbloreItemData.forEach(function(herbloreData) {
            herbloreData['itemID'].forEach(function(itemID) {
                exp['items'][itemID]['herbloreLevel'] = herbloreData['herbloreLevel'];
            });
        });
        // Add Woodcutting Level To Item Array
        trees.forEach(function(tree) {
            var logName = tree['type'].charAt(0).toUpperCase() + tree['type'].slice(1) + " Logs"
            exp['items'].forEach(function(item) {
                if (item['name'] == logName) {
                    item['woodcuttingLevel'] = tree['level']
                }
            })
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
    $('#dataExport').val('var melvorData = ' + generateDataExport());
    //generateDataExport()
});