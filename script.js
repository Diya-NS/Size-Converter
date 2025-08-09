const sizeCharts = {
    men: {
        hm: [
            { size: 'S', chest: [88, 96], waist: [76, 84] },
            { size: 'M', chest: [96, 104], waist: [84, 92] },
            { size: 'L', chest: [104, 112], waist: [92, 100] }
        ],
        zara: [
            { size: 'S', chest: [90, 98], waist: [78, 86] },
            { size: 'M', chest: [98, 106], waist: [86, 94] },
            { size: 'L', chest: [106, 114], waist: [94, 102] }
        ]
    },
    women: {
        hm: [
            { size: 'S', chest: [82, 88], waist: [66, 72], hips: [90, 96] },
            { size: 'M', chest: [88, 94], waist: [72, 78], hips: [96, 102] },
            { size: 'L', chest: [94, 100], waist: [78, 84], hips: [102, 108] }
        ],
        zara: [
            { size: 'S', chest: [84, 90], waist: [68, 74], hips: [92, 98] },
            { size: 'M', chest: [90, 96], waist: [74, 80], hips: [98, 104] },
            { size: 'L', chest: [96, 102], waist: [80, 86], hips: [104, 110] }
        ]
    }
};

function convertSizes() {
    let gender = document.getElementById('gender').value;
    let unit = document.getElementById('unit').value;
    let chest = parseFloat(document.getElementById('chest').value);
    let waist = parseFloat(document.getElementById('waist').value);
    let hips = parseFloat(document.getElementById('hips').value);
    
    if (unit === 'in') {
        chest *= 2.54;
        waist *= 2.54;
        hips *= 2.54;
    }

    let stores = sizeCharts[gender];
    let output = '';

    for (let store in stores) {
        let match = stores[store].find(sizeObj => {
            if (gender === 'men') {
                return chest >= sizeObj.chest[0] && chest <= sizeObj.chest[1] &&
                       waist >= sizeObj.waist[0] && waist <= sizeObj.waist[1];
            } else {
                return chest >= sizeObj.chest[0] && chest <= sizeObj.chest[1] &&
                       waist >= sizeObj.waist[0] && waist <= sizeObj.waist[1] &&
                       hips >= sizeObj.hips[0] && hips <= sizeObj.hips[1];
            }
        });
        output += `<p><strong>${store.toUpperCase()}:</strong> ${match ? match.size : 'No match'}</p>`;
    }

    document.getElementById('result').innerHTML = output;
}
