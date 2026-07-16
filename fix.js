const fs = require('fs');
let txt = fs.readFileSync('components/tabs/TabPostos.tsx', 'utf8');
txt = txt.replace(/faturamento: "Mensal"/g, 'faturamento: "Mensal" as any');
fs.writeFileSync('components/tabs/TabPostos.tsx', txt);
