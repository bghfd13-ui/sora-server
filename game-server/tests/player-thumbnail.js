const ws = require('./render-ws');
const path = require('path');
const fs = require('fs');
const outDir = path.join(__dirname, './out/');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
}
const avatar = {
    userId: 1,
    scales: {}, // ignored in r6
    bodyColors: {
        headColorId: 1,
        torsoColorId: 1,
        rightArmColorId: 1,
        leftArmColorId: 1,
        rightLegColorId: 1,
        leftLegColorId: 1,
    },
    playerAvatarType: 'R6',
    assets: [
    ],
}
console.log('send');
ws('GenerateThumbnail', [avatar]).then(res => {
    console.log('ok?')
    console.log('=== FULL RCC RESPONSE ==='); console.log(JSON.stringify(res, null, 2)); if (!res || res.status !== 200 || !res.data) { console.error('THUMBNAIL GENERATION FAILED'); process.exit(1); } const icon = res.data;
    // console.log('ok', icon);
    const fPath = outDir + 'player-thumbnail.png'
    fs.writeFileSync(fPath, Buffer.from(icon, 'base64'));
    const open = 'file:///' + fPath.replace(/\\/g, '/');
    console.log(open);
    process.exit(0);
}).catch(e => {
    console.error('err',e)
})
console.log('uhh')
