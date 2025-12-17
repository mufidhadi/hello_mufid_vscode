const vscode = require('vscode');
const https = require('https');

class MupidChatViewProvider {
    constructor(context) {
        this._context = context;
        this._lastData = "";
        this._panel = null; // Track the custom panel so we can reuse it
    }

    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = { enableScripts: true };
        webviewView.webview.html = this._getSidebarHtml();

        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'fetchApi':
                    this._fetchFromN8n();
                    break;
                case 'openInPanel':
                    this._openCustomPanel();
                    break;
                case 'insertToEditor':
                    this._insertToActiveEditor();
                    break;
            }
        });
    }

    async _fetchFromN8n() {
        const url = 'https://n8n.synapsis.id/webhook/extension-mupid';

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Lagi mikir jokesnya...",
            cancellable: false
        }, async () => {
            try {
                const result = await this._httpRequest(url);
                this._lastData = result; // Simpan ke variable
                this._view.webview.postMessage({ type: 'apiResult', value: result });
            } catch (err) {
                // vscode.window.showErrorMessage("Gagal mikir jokes gara-gara: " + err.message);
                const backupJoke = this.backup_jokes();
                this._lastData = backupJoke; // Simpan ke variable
                this._view.webview.postMessage({ type: 'apiResult', value: backupJoke });
                console.log("Gagal mikir jokes gara-gara: " + err.message);
            }
        });
    }

    backup_jokes() {
        const jokes = [
            "Gagal connect ke server itu rasanya kayak nungguin janji kampanye, statusnya 'Connecting' terus tapi nggak pernah 'Connected'.",
            "AI sehebat ChatGPT pun bakal jadi bego kalau kena 'Network Error', persis kayak pejabat pas ditanya soal data kemiskinan.",
            "Server pemerintah down itu sebenernya bukan masalah teknis, tapi lagi simulasi biar rakyat terbiasa dengan pelayanan yang tidak ada.",
            "Request Timeout itu definisi paling akurat buat birokrasi kita: kita yang minta, mereka yang diam sampai koneksinya putus sendiri.",
            "Koneksi internet lambat itu disengaja, biar rakyat nggak terlalu cepet nemu jejak digital para paslon yang memalukan.",
            "Error 404: Not Found itu status paling cocok buat wakil rakyat yang tiba-tiba hilang pas ada demo di depan kantornya.",
            "Server KPU kalau 'Connection Failed' biasanya dibarengi dengan keajaiban angka yang tiba-tiba loncat ke langit.",
            "Programming di Indonesia itu tantangannya berat, baru mau 'npm install' eh internetnya udah kena reshuffle sama provider.",
            "ChatGPT bilang 'Internal Server Error', saya bilang 'Welcome to Indonesia', di mana internet cepat malah ditanya buat apa.",
            "Ping tinggi di server itu mirip sama respon pemerintah kalau ada jalan rusak: nyampenya lama banget, itu pun kalau nggak RTO.",
            "Database Connection Failed itu kayak ingatan politisi pas lagi disidang kasus korupsi, tiba-tiba amnesia berjamaah.",
            "Koneksi putus itu kayak hubungan politisi dan rakyat, cuma nyambung pas butuh tethering suara di musim kampanye doang.",
            "AI nggak bisa kerja tanpa server, sama kayak caleg yang nggak bisa gerak tanpa asupan logistik dari pengusaha tambang.",
            "502 Bad Gateway itu adalah gerbang kantor dinas pas rakyat mau lapor masalah, pintunya kelihatan tapi nggak bisa dimasuki.",
            "Packet loss itu fenomena di mana paket bansos dikirim dari pusat isinya sepuluh, tapi pas sampe ke warga sisa lima.",
            "Server Under Maintenance itu bahasa halus dari 'Kami lagi bingung mau nyari alasan apa lagi buat nutupin skandal ini'.",
            "SSH itu akses jarak jauh, kayak mengendalikan partai dan pemerintahan dari balik layar tanpa harus punya jabatan resmi.",
            "VPN dipake buat bypass blokir internet, kalau jalur MK dipake buat bypass blokir aturan umur calon pemimpin.",
            "Latency hukum kita itu tinggi banget, lapornya di periode presiden sekarang, diputusnya mungkin pas cucu kita udah kerja.",
            "Localhost lancar tapi di server error, itu kayak rencana pembangunan di rapat yang indah banget tapi pas di lapangan zonk.",
            "Data di cloud itu aman, yang nggak aman itu dana proyek IT-nya yang tiba-tiba menguap ke awan sebelum servernya jadi.",
            "TCP Handshake itu formalitas koneksi, kalau 'Handshake' di hotel bintang lima itu namanya lobi-lobi jatah kursi menteri.",
            "Algoritma AI butuh koneksi stabil, kalau algoritma politik kita cuma butuh koneksi ke 'orang dalem' yang tepat.",
            "Internet mati pas lagi coding itu musibah, tapi server mati pas lagi rekapitulasi suara itu namanya strategi.",
            "Firewall paling kuat di dunia itu bukan software, tapi kalimat 'atas perintah atasan' yang memblokir semua akses transparansi.",
            "Gagal connect ke server pusat itu biasa, yang luar biasa itu gagal connect ke hati nurani setelah menjabat dua periode.",
            "DDoS attack itu kalah rame sama serangan netizen Indonesia kalau ada akun pejabat yang ketahuan blunder di Twitter.",
            "Cloud native itu aplikasi modern, kalau 'Cloud Nepotisme' itu cara modern buat naruh keluarga di posisi strategis.",
            "Retry Connection itu kayak politisi yang udah gagal berkali-kali tapi tetep nyalon lagi pake casing partai yang berbeda.",
            "Internet di pelosok sering RTO karena bandwidth-nya habis dipake buat muterin video pencitraan di ibu kota.",
            "IP Address koruptor itu gampang dilacak, yang susah dilacak itu niat baiknya yang emang nggak pernah ada sejak awal.",
            "Error 503 Service Unavailable: Layanan ini tidak tersedia, sama kayak janji sekolah gratis yang cuma ada di dalam baliho."
        ]

        return jokes[Math.floor(Math.random() * jokes.length)];
    }

    // MEMBUKA PANEL WEBVIEW BARU
    _openCustomPanel() {
        if (!this._lastData) return vscode.window.showWarningMessage("klik tombol di atas dulu!");

        // If a panel already exists, reveal it and update its content
        if (this._panel) {
            try {
                this._panel.reveal(vscode.ViewColumn.One);
                this._panel.webview.html = this._getPanelHtml(this._lastData);
                return;
            } catch (e) {
                // If reveal/update fails for some reason, fall through to recreate
                this._panel = null;
            }
        }

        const panel = vscode.window.createWebviewPanel(
            'mupidDetail', // Identitas internal
            'Mupid Quote Detail', // Judul tab
            vscode.ViewColumn.One, // Muncul di kolom editor pertama
            { enableScripts: true }
        );

        this._panel = panel;
        panel.webview.html = this._getPanelHtml(this._lastData);

        // Clear reference when disposed so a new panel can be created later
        panel.onDidDispose(() => {
            this._panel = null;
        }, null, this._context.subscriptions);
    }

    _insertToActiveEditor() {
        const editor = vscode.window.activeTextEditor;
        if (editor && this._lastData) {
            editor.edit(edit => edit.insert(editor.selection.active, this._lastData));
        }
    }

    _httpRequest(url) {
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => resolve(data));
            }).on('error', (err) => reject(err));
        });
    }

    random_pantun() {
        const pantuns = [
            "Makan teri campur nasi,</br>klik tombol di atas buat eksekusi.",
            "ChatGPT pinter bikin puisi,</br>klik tombol di atas biar dapet solusi.",
            "Nungguin update servernya lama,</br>klik tombol di atas kita maju bersama.",
            "Banyak janji di baliho gede,</br>klik tombol di atas dulu dong de.",
            "Codingan error gara-gara typo,</br>klik tombol di atas jangan cuma kepo.",
            "Beli gorengan dapetnya bakwan,</br>klik tombol di atas wahai kawan.",
            "Prompt engineering biar dapet jawaban,</br>klik tombol di atas buat masa depan.",
            "Mau bansos harus antre,</br>klik tombol di atas dulu bre.",
            "Data bocor dijual di forum,</br>klik tombol di atas sebelum dihukum.",
            "Pusing pala liat harga bensin,</br>klik tombol di atas biar makin yakin.",
            "Siang-siang minum es tebu,</br>klik tombol di atas janganlah ragu.",
            "Revisi terus nggak kelar-kelar,</br>klik tombol di atas biar makin sangar.",
            "Koalisi bubar gara-gara jatah,</br>klik tombol di atas biar nggak patah.",
            "Laptop nge-hang gara-gara Chrome,</br>klik tombol di atas biar langsung boom.",
            "Robot AI bisa bikin konten,</br>klik tombol di atas biar makin paten.",
            "Mantan lewat bawa gandengan,</br>klik tombol di atas mumpung ada kesempatan."
        ]

        return pantuns[Math.floor(Math.random() * pantuns.length)];
    }

    // HTML UNTUK SIDEBAR (Sama seperti sebelumnya)
    _getSidebarHtml() {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: sans-serif; padding: 10px; color: var(--vscode-foreground); }
                    button { background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; padding: 8px; width: 100%; cursor: pointer; margin-bottom: 5px; }
                    #result { background: var(--vscode-editor-background); padding: 10px; margin: 10px 0; border: 1px solid #555; font-size: 11px; }
                    .hidden { display: none; }
                </style>
            </head>
            <body>
                <button id="fetchBtn">Kata-kata lucu</button>
                <div id="result">${this.random_pantun()}</div>
                <div id="actions" class="hidden">
                    <button id="openBtn" style="background: var(--vscode-button-secondaryBackground)">Open di Panel</button>
                    <button id="insertBtn" style="background: var(--vscode-button-secondaryBackground)">Input ke Coding</button>
                </div>
                <script>
                    const vscode = acquireVsCodeApi();
                    document.getElementById('fetchBtn').onclick = () =>{ 
                        document.getElementById('result').innerText = 'bentar, gue mikir dulu...';
                        document.getElementById('actions').classList.add('hidden');
                        vscode.postMessage({ type: 'fetchApi' });
                    };
                    document.getElementById('openBtn').onclick = () => vscode.postMessage({ type: 'openInPanel' });
                    document.getElementById('insertBtn').onclick = () => vscode.postMessage({ type: 'insertToEditor' });
                    window.onmessage = (e) => {
                        if(e.data.type === 'apiResult') {
                            document.getElementById('result').innerText = e.data.value;
                            document.getElementById('actions').classList.remove('hidden');
                        }
                    };
                </script>
            </body>
            </html>`;
    }

    // HTML UNTUK PANEL BARU (Judul, Quote, Microphone)
    _getPanelHtml(content) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { 
                        display: flex; flex-direction: column; align-items: center; justify-content: center; 
                        height: 100vh; font-family: 'Segoe UI', sans-serif; text-align: center;
                        background: var(--vscode-editor-background); color: var(--vscode-editor-foreground);
                    }
                    .icon { font-size: 50px; margin-bottom: 20px; }
                    h1 { color: var(--vscode-textLink-foreground); margin-bottom: 10px; }
                    .quote-card {
                        background: var(--vscode-textBlockQuote-background);
                        padding: 30px; border-radius: 15px; border-left: 10px solid var(--vscode-textLink-foreground);
                        max-width: 80%; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                        font-size: 1.5em; font-style: italic; line-height: 1.6;
                    }
                </style>
            </head>
            <body>
                <div class="icon">🎤</div>
                <h1>Mupid Voice</h1>
                <div class="quote-card">
                    "${content}"
                </div>
            </body>
            </html>`;
    }
}

function activate(context) {
    const provider = new MupidChatViewProvider(context);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('mupidChatView', provider));
}

module.exports = { activate };