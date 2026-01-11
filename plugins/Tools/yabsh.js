import { exec } from 'child_process';

const runYabsh = () => {
    return new Promise((resolve, reject) => {
        exec('curl -sL yabs.sh | bash', (error, stdout, stderr) => {
            if (error) {
                reject(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                reject(`Stderr: ${stderr}`);
                return;
            }
            resolve(stdout);
        });
    });
};

const parseYabshOutput = (output) => {
    const lines = output.split('\n');
    let result = {
        uptime: '',
        processor: '',
        ram: '',
        swap: '',
        disk: '',
        isp: '',
        disk_speed: '',
        internet_speed: '',
        geekbench6_single: '',
        geekbench6_multi: '',
        geekbench6_url: ''
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('Uptime:')) result.uptime = line.split(':')[1].trim();
        if (line.includes('Processor:')) result.processor = line.split(':')[1].trim();
        if (line.includes('RAM:')) result.ram = line.split(':')[1].trim();
        if (line.includes('Swap:')) result.swap = line.split(':')[1].trim();
        if (line.includes('Disks:')) result.disk = line.split(':')[1].trim();
        if (line.includes('ISP:')) result.isp = line.split(':')[1].trim();
        if (line.includes('Disk speed:')) result.disk_speed = line.split(':')[1].trim();
        if (line.includes('Internet speed:')) result.internet_speed = line.split(':')[1].trim();
        if (line.includes('Geekbench 6 (Single-Core):')) result.geekbench6_single = line.split(':')[1].trim();
        if (line.includes('Geekbench 6 (Multi-Core):')) result.geekbench6_multi = line.split(':')[1].trim();
        if (line.includes('Geekbench 6 Result:')) result.geekbench6_url = line.split(':')[1].trim();
    }

    return result;
};

const handler = async (m, { conn }) => {
    try {
        const output = await runYabsh();
        const parsedOutput = parseYabshOutput(output);
        const response = `
            YABSH Result:
            - Uptime: ${parsedOutput.uptime}
            - Processor: ${parsedOutput.processor}
            - RAM: ${parsedOutput.ram}
            - Swap: ${parsedOutput.swap}
            - Disk: ${parsedOutput.disk}
            - ISP: ${parsedOutput.isp}
            - Disk Speed: ${parsedOutput.disk_speed}
            - Internet Speed: ${parsedOutput.internet_speed}
            - Geekbench 6 (Single-Core): ${parsedOutput.geekbench6_single}
            - Geekbench 6 (Multi-Core): ${parsedOutput.geekbench6_multi}
            - Geekbench 6 URL: ${parsedOutput.geekbench6_url}
        `;
        conn.reply(m.chat, response, m);
    } catch (error) {
        conn.reply(m.chat, `Terjadi kesalahan: ${error}`, m);
    }
};

handler.help = ['yabsh'];
handler.tags = ['tools'];
handler.command = /^(yabsh)$/i;


export default handler;