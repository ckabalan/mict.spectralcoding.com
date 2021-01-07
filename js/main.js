$(() => {
    $('#saveImport').on('blur', () => {
        // https://stackoverflow.com/a/41106346/606974
        saveJSON = JSON.parse(pako.ungzip(Uint8Array.from(atob($('#saveImport').val()), c => c.charCodeAt(0)), { to: 'string' }));
        saveData = JSON.stringify(saveJSON, null, 2);
        console.log(saveJSON.itemsAlreadyFound);
        console.log(items)
        items.forEach(function(item, index) {
            console.log(item)
            console.log(index)
        });
        //missingItems = allItemIds.filter(x => !(saveJSON.itemsAlreadyFound).includes(x));
    });
});