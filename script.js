// script.js
// Size data compiled from the user's charts (simplified ranges).
// All stored in inches. If user enters cm, we convert to inches.

const toInches = (val, units) => {
  if (!val && val !== 0) return null;
  const x = Number(val);
  if (isNaN(x)) return null;
  return units === 'cm' ? x / 2.54 : x;
};

// Size range helper: checks if value falls into [min, max] inclusive
function inRange(val, min, max) {
  return val >= min && val <= max;
}

// Data structures for each brand, gender, and category.
// Each entry is an array of objects with size label and required ranges.
const SIZE_DATA = {
  hm: {
    women: {
      tops: [
        {size: 'XS', bust: [30, 31.5], waist: [23.5,25.25]},
        {size: 'S', bust: [33,34.5], waist: [26.75,28.5]},
        {size: 'M', bust: [36.25,37.75], waist: [30,31.5]},
        {size: 'L', bust: [39.5,41], waist: [33,34.5]},
        {size: 'XL', bust: [43.25,45.5], waist: [37,39.5]},
      ],
      pants: [
        {size: 'XS', waist: [24,25], hips: [33,34.5]},
        {size: 'S', waist: [26,28], hips: [36.25,37.75]},
        {size: 'M', waist: [29,31], hips: [39.5,41]},
        {size: 'L', waist: [32,34], hips: [42.5,44]},
        {size: 'XL', waist: [37,39.5], hips: [46,48]},
        // plus sizes included further down
      ],
      dresses: [
        {size: 'XS', bust: [30,31.5], waist:[23.5,25.25], hips:[33,34.5]},
        {size: 'S', bust: [33,34.5], waist:[26.75,28.5], hips:[36.25,37.75]},
        {size: 'M', bust: [36.25,37.75], waist:[30,31.5], hips:[39.5,41]},
        {size: 'L', bust: [39.5,41], waist:[33,34.5], hips:[42.5,44]},
        {size: 'XL', bust: [43.25,45.5], waist:[37,39.5], hips:[46,48]},
        {size: '2XL', bust: [48,50.5], waist:[41.75,44], hips:[50,52]},
        {size: '3XL', bust: [52.75,55], waist:[46.5,48.75], hips:[54,56]},
      ]
    },
    men: {
      tops: [
        {size:'XS', chest:[31.5,33], waist:[26.75,28.25]},
        {size:'S', chest:[34.5,36.25], waist:[30,31.5]},
        {size:'M', chest:[37.75,39.5], waist:[33,34.5]},
        {size:'L', chest:[41,42.5], waist:[36.25,37.75]},
        {size:'XL', chest:[44,45.5], waist:[39.5,41]},
        {size:'XXL', chest:[47.25,48.75], waist:[42.5,44]},
      ],
      pants: [
        {size:'XS', waist:[26,28]},
        {size:'S', waist:[30,32]},
        {size:'M', waist:[34,36]},
        {size:'L', waist:[38,40]},
        {size:'XL', waist:[42,44]},
        {size:'XXL', waist:[50,52]},
      ],
      jackets: [
        {size:'40', chest:[39.5,39.5], waist:[34.5,34.5]},
        {size:'42', chest:[41,41], waist:[36.25,36.25]},
        {size:'44', chest:[42.5,42.5], waist:[37.75,37.75]},
        {size:'46', chest:[44,44], waist:[39.5,39.5]},
      ]
    }
  },

  zara: {
    // Zara's data is given in a few forms — simplified here.
    men: {
      tops: [
        {size:'S', chest:[35,36.5]},
        {size:'M', chest:[37,38.5]},
        {size:'L', chest:[39,40.5]},
        {size:'XL', chest:[41,42.5]},
        {size:'XXL', chest:[43,45]},
      ],
      pants: [
        {size:'S', waist:[28,30]},
        {size:'M', waist:[30,32]},
        {size:'L', waist:[32,34]},
        {size:'XL', waist:[34,36]},
      ]
    },
    women: {
      // Zara women's is not fully specified above, we'll provide a reasonable
      // pants & tops mapping based on provided insights (common ranges).
      tops: [
        {size:'XS', bust:[30,32]},
        {size:'S', bust:[33,34.5]},
        {size:'M', bust:[36,37.5]},
        {size:'L', bust:[39,40.5]},
        {size:'XL', bust:[42,44]},
      ],
      pants: [
        {size:'S', waist:[26,28]},
        {size:'M', waist:[29,31]},
        {size:'L', waist:[32,34]},
        {size:'XL', waist:[35,37]},
      ]
    }
  }
};

// Helper: tries to find matching size given measurement values and rules.
// preferenceFields is e.g. ['bust'] or ['waist','hips'] meaning we try to match
// using those fields (if present).
function findSizeForBrand(brandKey, gender, category, measurements) {
  const brand = SIZE_DATA[brandKey];
  if (!brand) return null;
  const genderData = brand[gender];
  if (!genderData) return null;
  const list = genderData[category];
  if (!list) return null;

  // We'll score sizes by how many measurement fields match (higher better).
  const scores = list.map(item => {
    let score = 0;
    let requiredChecks = 0;

    if (item.bust) { requiredChecks++; if (measurements.bust != null && inRange(measurements.bust, item.bust[0], item.bust[1])) score++; }
    if (item.chest) { requiredChecks++; if (measurements.chest != null && inRange(measurements.chest, item.chest[0], item.chest[1])) score++; }
    if (item.waist) { requiredChecks++; if (measurements.waist != null && inRange(measurements.waist, item.waist[0], item.waist[1])) score++; }
    if (item.hips) { requiredChecks++; if (measurements.hips != null && inRange(measurements.hips, item.hips[0], item.hips[1])) score++; }

    // if item has no numeric ranges (rare), skip it
    return { item, score, requiredChecks };
  });

  // Prefer sizes where at least one field matches. Break ties by highest score then by order.
  const filtered = scores.filter(s => s.score > 0);
  if (filtered.length === 0) {
    // No exact match — fall back to nearest by waist or chest if available
    // We'll compute distance using the first available field in order of importance.
    const priorityFields = ['waist','bust','chest','hips'];
    let best = null;
    let bestDist = Infinity;

    for (const s of scores) {
      // compute distance sum across fields that exist in item and measurement
      let dist = 0;
      let count = 0;
      ['waist','bust','chest','hips'].forEach(f => {
        if (s.item[f] && measurements[f] != null) {
          // if measurement smaller than min or bigger than max take difference to nearest bound
          const [min, max] = s.item[f];
          if (measurements[f] < min) dist += (min - measurements[f]);
          else if (measurements[f] > max) dist += (measurements[f] - max);
          else dist += 0; // inside range (should not happen because earlier filtered)
          count++;
        }
      });
      if (count === 0) continue;
      const avg = dist / count;
      if (avg < bestDist) { bestDist = avg; best = s; }
    }
    return best ? best.item.size : null;
  } else {
    // choose highest score; if tie choose the one with narrower ranges (more specific)
    filtered.sort((a,b) => {
      if (b.score !== a.score) return b.score - a.score;
      // compute specificity: sum of widths (smaller = more specific)
      function width(it) {
        let w = 0;
        if (it.item.bust) w += it.item.bust[1] - it.item.bust[0];
        if (it.item.chest) w += it.item.chest[1] - it.item.chest[0];
        if (it.item.waist) w += it.item.waist[1] - it.item.waist[0];
        if (it.item.hips) w += it.item.hips[1] - it.item.hips[0];
        return w;
      }
      return width(a) - width(b);
    });
    return filtered[0].item.size;
  }
}

// UI wiring
document.addEventListener('DOMContentLoaded', () => {
  const genderEl = document.getElementById('gender');
  const categoryEl = document.getElementById('category');
  const unitsEl = document.getElementById('units');
  const chestEl = document.getElementById('chest');
  const waistEl = document.getElementById('waist');
  const hipsEl = document.getElementById('hips');
  const convertBtn = document.getElementById('convertBtn');
  const resetBtn = document.getElementById('resetBtn');
  const resultsContent = document.getElementById('resultsContent');

  function populateCategories() {
    const g = genderEl.value;
    categoryEl.innerHTML = '';
    const optionsForGender = g === 'women'
      ? ['tops','pants','dresses']
      : ['tops','pants','jackets'];
    optionsForGender.forEach(opt => {
      const label = opt.charAt(0).toUpperCase() + opt.slice(1);
      const el = document.createElement('option');
      el.value = opt;
      el.textContent = label;
      categoryEl.appendChild(el);
    });
  }

  populateCategories();
  genderEl.addEventListener('change', populateCategories);

  resetBtn.addEventListener('click', () => {
    document.getElementById('converterForm').reset();
    populateCategories();
    resultsContent.innerHTML = '<p>No results yet — enter measurements and click <strong>Convert size</strong>.</p>';
  });

  convertBtn.addEventListener('click', () => {
    const gender = genderEl.value;
    const units = unitsEl.value;
    const category = categoryEl.value;
    const chest = toInches(chestEl.value.trim(), units);
    const waist = toInches(waistEl.value.trim(), units);
    const hips = toInches(hipsEl.value.trim(), units);

    // Minimal validation: require at least one relevant measurement depending on category
    const needed = (category === 'tops' || category === 'dresses') ? ['chest','waist'] : ['waist'];
    const provided = { chest, waist, hips };
    const providedAny = needed.some(k => provided[k] != null && provided[k] > 0);
    if (!providedAny) {
      resultsContent.innerHTML = `<p style="color:#b33">Please enter at least one relevant measurement (${needed.join(' or ')}).</p>`;
      return;
    }

    // selected brands
    const brandChecks = Array.from(document.querySelectorAll('input[type=checkbox]:checked')).map(c => c.value);
    if (brandChecks.length === 0) {
      resultsContent.innerHTML = `<p style="color:#b33">Please select at least one brand.</p>`;
      return;
    }

    const measurements = {
      chest: chest || null,
      bust: chest || null, // bust and chest treated similarly for matching
      waist: waist || null,
      hips: hips || null
    };

    // Build results
    resultsContent.innerHTML = ''; // clear
    brandChecks.forEach(brandKey => {
      const brandDiv = document.createElement('div');
      brandDiv.className = 'brand-result';
      const brandName = brandKey === 'hm' ? 'H&M' : brandKey === 'zara' ? 'Zara' : brandKey;
      const h = document.createElement('h3');
      h.textContent = brandName;
      brandDiv.appendChild(h);

      const sizeLabel = findSizeForBrand(brandKey, gender, category, measurements);
      const listDiv = document.createElement('div');
      listDiv.className = 'size-list';

      const sizeBlock = document.createElement('div');
      sizeBlock.className = 'size-item';
      sizeBlock.innerHTML = `<strong>Recommended size:</strong><div style="font-size:1.2rem;margin-top:6px">${sizeLabel || 'No close match'}</div>`;

      // include the measurement used (converted back to user's units)
      function toDisplay(val) {
        if (val == null) return '-';
        return units === 'cm' ? (val * 2.54).toFixed(1) + ' cm' : val.toFixed(1) + ' in';
      }
      const measBlock = document.createElement('div');
      measBlock.className = 'size-item';
      measBlock.innerHTML = `<strong>Measurements used</strong>
        <div>Chest/Bust: ${toDisplay(measurements.chest)}</div>
        <div>Waist: ${toDisplay(measurements.waist)}</div>
        <div>Hips: ${toDisplay(measurements.hips)}</div>`;

      listDiv.appendChild(sizeBlock);
      listDiv.appendChild(measBlock);
      brandDiv.appendChild(listDiv);
      resultsContent.appendChild(brandDiv);
    });
  });

});
