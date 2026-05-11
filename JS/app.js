// __________  1. Funções de Storage (Persistência) __________
// Requisito 6: Estruturar dados corretamente no localStorage
const getData = (key) => JSON.parse(localStorage.getItem(key)) || [];
const setData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// __________  2. Funções de UI (Interface e Modais) __________
function exibirAlerta(titulo, mensagem) {
    document.getElementById("tituloAlerta").innerText = titulo;
    document.getElementById("mensagemAlerta").innerText = mensagem;
    
    const elementoModal = document.getElementById('modalAlert');
    if (elementoModal) {
        const modalBootstrap = new bootstrap.Modal(elementoModal);
        modalBootstrap.show();
    }
}

function abrirModalConfirm(titulo, mensagem) {
    return new Promise((resolve) => {
        const modalEl = document.getElementById('modalConfirm');
        const confirmBody = document.getElementById('confirmBody');
        const confirmYesBtn = document.getElementById('confirmYesBtn');
        const confirmNoBtn = document.getElementById('confirmNoBtn');
        const modal = new bootstrap.Modal(modalEl);
        let resolved = false;

        confirmBody.innerText = mensagem;
        modal.show();

        const cleanup = () => {
            confirmYesBtn.removeEventListener('click', onYes);
            confirmNoBtn.removeEventListener('click', onNo);
            modalEl.removeEventListener('hidden.bs.modal', onHidden);
        };

        const onYes = () => {
            resolved = true;
            cleanup();
            modal.hide();
            resolve(true);
        };

        const onNo = () => {
            resolved = true;
            cleanup();
            modal.hide();
            resolve(false);
        };

        const onHidden = () => {
            if (!resolved) {
                resolve(false);
            }
            cleanup();
        };

        confirmYesBtn.addEventListener('click', onYes);
        confirmNoBtn.addEventListener('click', onNo);
        modalEl.addEventListener('hidden.bs.modal', onHidden);
    });
}

function getTextColor(hex) {
    // Remove # if present
    hex = hex.replace('#', '');
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    // Calculate brightness
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
}

function abrirModalInput(titulo, mensagem, valorInicial = '', placeholder = '') {
    return new Promise((resolve) => {
        const modalEl = document.getElementById('modalInput');
        const tituloInput = document.getElementById('tituloInput');
        const inputBody = document.getElementById('inputBody');
        const inputField = document.getElementById('inputField');
        const confirmBtn = document.getElementById('inputConfirmBtn');
        const cancelBtn = document.getElementById('inputCancelBtn');
        const modal = new bootstrap.Modal(modalEl);
        let resolved = false;

        tituloInput.innerText = titulo;
        inputBody.innerText = mensagem;
        inputField.value = valorInicial || '';
        inputField.placeholder = placeholder || '';

        modal.show();
        inputField.focus();

        const cleanup = () => {
            confirmBtn.removeEventListener('click', onConfirm);
            cancelBtn.removeEventListener('click', onCancel);
            inputField.removeEventListener('keydown', onKeyDown);
            modalEl.removeEventListener('hidden.bs.modal', onHidden);
        };

        const onConfirm = () => {
            resolved = true;
            cleanup();
            modal.hide();
            resolve(inputField.value.trim());
        };

        const onCancel = () => {
            resolved = true;
            cleanup();
            modal.hide();
            resolve(null);
        };

        const onHidden = () => {
            if (!resolved) {
                resolve(null);
            }
            cleanup();
        };

        const onKeyDown = (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                onConfirm();
            }
        };

        confirmBtn.addEventListener('click', onConfirm);
        cancelBtn.addEventListener('click', onCancel);
        inputField.addEventListener('keydown', onKeyDown);
        modalEl.addEventListener('hidden.bs.modal', onHidden);
    });
}

// __________  3. Regras de Negócio: Salas __________
function criarSala() {
    const inputSala = document.getElementById("nomeSala");
    const inputCor = document.getElementById("corSala");
    const nome = inputSala.value.trim();
    const cor = inputCor.value;

    // Requisito 5: Impedir cadastro com campo vazio
    if (!nome) {
        exibirAlerta("Campo Vazio", "Por favor, digite um nome para a sala.");
        return; // O return vem DEPOIS para interromper o salvamento
    }

    const salas = getData("salas");
    
    // Requisito 1: Não pode existir duas salas com o mesmo nome
    const salaExiste = salas.find(s => s.nome.toLowerCase() === nome.toLowerCase());
    if (salaExiste) {
        exibirAlerta("Erro de Cadastro", "Esta sala já existe no sistema.");
        return;
    }
    
    salas.push({ id: Date.now(), nome, cor });
    setData("salas", salas);
    
    inputSala.value = "";
    inputCor.value = "#007bff"; // reset to default
    exibirAlerta("Sucesso!", `A sala "${nome}" foi criada.`);
    
    atualizarSelects();
    listarSalas();
}

// __________  4. Regras de Negócio: Alunos __________
function cadastrarAluno() {
    const nome = document.getElementById("nomeAluno").value.trim();
    const salaId = document.getElementById("selectSala").value;

    // Requisito 5: Impedir aluno sem sala e campo vazio
    if (!nome || !salaId) {
        exibirAlerta("Erro de cadastro", "Preencha o nome e selecione uma sala.");
        return;
    }

    const alunos = getData("alunos");
    const alunoExiste = alunos.find(a => a.nome.toLowerCase() === nome.toLowerCase() && a.salaId === salaId);
    if (alunoExiste) {
        exibirAlerta("Erro de cadastro", "Este aluno já existe nesta sala.");
        return;
    }

    alunos.push({ id: Date.now(), nome, salaId });
    setData("alunos", alunos);

    document.getElementById("nomeAluno").value = "";
    listarAlunosGeral();
    exibirAlerta("Sucesso!", `O aluno "${nome}" foi cadastrado.`);
}

// Requisito 1: Listagem organizada 
function listarAlunosGeral() {
    const alunos = getData("alunos");
    const salas = getData("salas");
    const lista = document.getElementById("listaAlunos");

    if (!lista) return;

    lista.innerHTML = "";
    alunos.forEach(a => {
        const sala = salas.find(s => s.id == a.salaId);
        const salaNome = sala?.nome || 'Sem sala';
        const salaCor = sala?.cor || '#ffffff';
        const textColor = getTextColor(salaCor);
        lista.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <strong>${a.nome}</strong><br>
                    <small><span style="background-color: ${salaCor}; color: ${textColor}; padding: 2px 6px; border-radius: 4px;">${salaNome}</span></small>
                </div>
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-primary" onclick="editarAluno(${a.id})"><i class="bi bi-pencil-fill me-1"></i>Editar</button>
                    <button class="btn btn-outline-danger" onclick="removerAluno(${a.id})"><i class="bi bi-trash-fill me-1"></i>Excluir</button>
                </div>
            </li>
        `;
    });
}

function listarSalas() {
    const salas = getData("salas");
    const lista = document.getElementById("listaSalas");

    if (!lista) return;

    lista.innerHTML = "";
    salas.forEach(s => {
        const textColor = getTextColor(s.cor || '#ffffff');
        lista.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span style="background-color: ${s.cor || '#ffffff'}; color: ${textColor}; padding: 2px 6px; border-radius: 4px;">${s.nome}</span>
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-primary" onclick="editarSala(${s.id})"><i class="bi bi-pencil-fill me-1"></i>Editar</button>
                    <button class="btn btn-outline-danger" onclick="removerSala(${s.id})"><i class="bi bi-trash-fill me-1"></i>Excluir</button>
                </div>
            </li>
        `;
    });
}

async function editarSala(id) {
    const salas = getData("salas");
    const sala = salas.find(s => s.id == id);
    if (!sala) return;

    return new Promise((resolve) => {
        const modalEl = document.getElementById('modalEditarSala');
        const editNomeSala = document.getElementById('editNomeSala');
        const editCorSala = document.getElementById('editCorSala');
        const confirmarBtn = document.getElementById('confirmarEditarSalaBtn');

        editNomeSala.value = sala.nome;
        editCorSala.value = sala.cor || '#007bff';

        const modal = new bootstrap.Modal(modalEl);
        modal.show();

        const onConfirm = () => {
            const novoNome = editNomeSala.value.trim();
            const novaCor = editCorSala.value;

            if (!novoNome) {
                exibirAlerta("Nome inválido", "O nome da sala não pode ficar vazio.");
                return;
            }

            const salaExiste = salas.find(s => s.nome.toLowerCase() === novoNome.toLowerCase() && s.id != id);
            if (salaExiste) {
                exibirAlerta("Erro de cadastro", "Já existe outra sala com esse nome.");
                return;
            }

            sala.nome = novoNome;
            sala.cor = novaCor;
            setData("salas", salas);
            atualizarSelects();
            listarSalas();
            listarAlunosGeral();
            exibirAlerta("Sucesso!", `A sala foi atualizada.`);
            modal.hide();
            resolve();
        };

        confirmarBtn.onclick = onConfirm;

        modalEl.addEventListener('hidden.bs.modal', () => {
            confirmarBtn.onclick = null;
            resolve();
        }, { once: true });
    });
}

function removerSala(id) {
    const alunos = getData("alunos");
    const salaComAlunos = alunos.some(a => a.salaId == id);

    if (salaComAlunos) {
        exibirAlerta("Não é possível remover", "Remova os alunos dessa sala antes de excluí-la.");
        return;
    }

    const salas = getData("salas").filter(s => s.id != id);
    setData("salas", salas);
    atualizarSelects();
    listarSalas();
    exibirAlerta("Removido", "A sala foi removida com sucesso.");
}

async function editarAluno(id) {
    const alunos = getData("alunos");
    const aluno = alunos.find(a => a.id == id);
    if (!aluno) return;

    const novoNome = await abrirModalInput("Editar aluno", "Digite o novo nome do aluno:", aluno.nome, "Ex: Maria Souza");
    if (novoNome === null) return;

    const nomeFormatado = novoNome.trim();
    if (!nomeFormatado) {
        exibirAlerta("Nome inválido", "O nome do aluno não pode ficar vazio.");
        return;
    }

    const mesmaSala = alunos.some(a => a.id != id && a.nome.toLowerCase() === nomeFormatado.toLowerCase() && a.salaId == aluno.salaId);
    if (mesmaSala) {
        exibirAlerta("Erro de cadastro", "Já existe um aluno com esse nome nessa sala.");
        return;
    }

    aluno.nome = nomeFormatado;
    setData("alunos", alunos);
    listarAlunosGeral();
    exibirAlerta("Sucesso!", "Nome do aluno atualizado.");
}

async function removerAluno(id) {
    const confirmou = await abrirModalConfirm("Excluir aluno", "Deseja realmente excluir este aluno?");
    if (!confirmou) return;

    const alunos = getData("alunos").filter(a => a.id != id);
    setData("alunos", alunos);
    listarAlunosGeral();
    exibirAlerta("Removido", "O aluno foi excluído do sistema.");
}

// __________  5. Regras de Negócio: Chamada e Histórico __________
function carregarChamada() {
    const salaId = document.getElementById("filtroSala").value;
    const data = document.getElementById("dataChamada").value;
    const hoje = new Date().toISOString().split('T')[0];
    const container = document.getElementById("containerChamada") || document.getElementById("chamada");

    // Requisito 5: Presença sem data ou sem sala
    if (!salaId || !data) {
        exibirAlerta("Erro", "Selecione a sala e a data da chamada.");
        return;
    }

    if (data > hoje) {
        exibirAlerta("Data inválida", "Não é possível carregar chamada para data futura.");
        return;
    }

    const alunos = getData("alunos").filter(a => a.salaId == salaId);
    const presencas = getData("presencas");
    container.innerHTML = "";

    alunos.forEach(a => {
        const registro = presencas.find(p => p.alunoId == a.id && p.data == data);
        const isPresente = registro ? registro.historico[registro.historico.length - 1].presente : false;
        const classe = registro ? (isPresente ? 'bg-success-subtle' : 'bg-danger-subtle') : '';

        container.innerHTML += `
            <div class="d-flex justify-content-between align-items-center border p-3 mb-2 rounded ${classe}">
                <div>
                    <strong>${a.nome}</strong>
                </div>
                <div class="d-flex gap-2 align-items-center">
                    <span class="badge ${registro ? (isPresente ? 'bg-success' : 'bg-danger') : 'bg-secondary'}">
                        ${registro ? (isPresente ? 'Presente' : 'Ausente') : 'Sem registro'}
                    </span>
                    <button class="btn btn-outline-secondary btn-sm" onclick="mostrarHistorico(${a.id}, '${data}')"><i class="bi bi-clock-history me-1"></i>Histórico</button>
                    <input type="checkbox" ${isPresente ? "checked" : ""} onchange="marcarPresenca(${a.id}, this)">
                </div>
            </div>
        `;
    });
}

async function marcarPresenca(alunoId, checkbox) {
    const data = document.getElementById("dataChamada").value;
    const hoje = new Date().toISOString().split('T')[0];
    let presencas = getData("presencas");
    const registro = presencas.find(p => p.alunoId == alunoId && p.data == data);
    const novoStatus = checkbox.checked;

    if (!data) {
        exibirAlerta("Erro", "Selecione a data antes de marcar a presença.");
        checkbox.checked = !novoStatus;
        return;
    }

    if (data > hoje) {
        exibirAlerta("Data inválida", "Não é possível registrar presença para data futura.");
        checkbox.checked = !novoStatus;
        return;
    }

    let justificativa = "";
    if (data < hoje) {
        try {
            justificativa = await solicitarJustificativa();
            if (!justificativa.trim()) {
                throw new Error("Sem justificativa");
            }
        } catch {
            checkbox.checked = !novoStatus;
            return;
        }
    }

    const log = {
        presente: novoStatus,
        timestamp: new Date().toLocaleString(),
        justificativa
    };

    if (registro) {
        registro.historico.push(log);
    } else {
        presencas.push({
            alunoId,
            data,
            historico: [log]
        });
    }

    setData("presencas", presencas);
    
    const salaId = document.getElementById("filtroSala").value;
    const dataAtual = document.getElementById("dataChamada").value;
    if (salaId && dataAtual) {
        carregarChamada();
    }
}

function solicitarJustificativa() {
    return new Promise((resolve, reject) => {
        const modalEl = document.getElementById('modalJustificativa');
        const texto = document.getElementById('textoJustificativa');
        const confirmarButton = document.getElementById('confirmarJustificativaBtn');
        const modal = new bootstrap.Modal(modalEl);
        let respostaRegistrada = false;

        texto.value = "";
        modal.show();

        const fechar = () => {
            if (!respostaRegistrada) reject();
            cleanup();
        };

        const confirmar = () => {
            respostaRegistrada = true;
            const valor = texto.value.trim();
            if (!valor) {
                exibirAlerta("Justificativa obrigatória", "Digite uma justificativa para a alteração.");
                return;
            }
            resolve(valor);
            modal.hide();
        };

        const onHidden = () => {
            if (!respostaRegistrada) reject();
            cleanup();
        };

        const cleanup = () => {
            modalEl.removeEventListener('hidden.bs.modal', onHidden);
            confirmarButton.removeEventListener('click', confirmar);
            texto.removeEventListener('keydown', onEnter);
        };

        const onEnter = (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                confirmar();
            }
        };

        modalEl.addEventListener('hidden.bs.modal', onHidden);
        confirmarButton.addEventListener('click', confirmar);
        texto.addEventListener('keydown', onEnter);
    });
}

function mostrarHistorico(alunoId, data) {
    const presencas = getData("presencas");
    const alunos = getData("alunos");
    const aluno = alunos.find(a => a.id == alunoId);
    const registro = presencas.find(p => p.alunoId == alunoId && p.data == data);
    const historicoConteudo = document.getElementById("historicoConteudo");
    const titulo = document.getElementById("tituloHistorico");

    titulo.innerText = `Histórico de ${aluno?.nome || 'Aluno'} - ${data}`;

    if (!registro) {
        historicoConteudo.innerHTML = `<p>Nenhum registro encontrado para esta data.</p>`;
    } else {
        historicoConteudo.innerHTML = `<ul class="list-group">${registro.historico.map(entry => `
            <li class="list-group-item">
                <div><strong>${entry.presente ? 'Presente' : 'Ausente'}</strong> - ${entry.timestamp}</div>
                <div>${entry.justificativa ? `<em>Justificativa:</em> ${entry.justificativa}` : '<em>Sem justificativa</em>'}</div>
            </li>
        `).join('')}</ul>`;
    }

    const modal = new bootstrap.Modal(document.getElementById('modalHistorico'));
    modal.show();
}

// __________  6. Relatórios Obrigatórios __________
function gerarRelatorios() {
    const alunos = getData("alunos");
    const presencas = getData("presencas");
    const salas = getData("salas");
    const tbody = document.getElementById("tabelaRelatorios");

    if (!tbody) return;
    tbody.innerHTML = "";

    alunos.forEach(aluno => {
        const registros = presencas.filter(p => p.alunoId == aluno.id);
        const totalDias = registros.length;
        const totalPresencas = registros.filter(r => r.historico[r.historico.length - 1].presente).length;
        const faltas = totalDias - totalPresencas; // Requisito 4
        const pct = totalDias > 0 ? ((totalPresencas / totalDias) * 100).toFixed(0) : 0; // Requisito 4
        const diasPresente = registros
            .filter(r => r.historico[r.historico.length - 1].presente)
            .map(r => r.data)
            .sort();
        const ultimoDiaPresente = diasPresente.length > 0 ? diasPresente[diasPresente.length - 1] : '---';

        const sala = salas.find(s => s.id == aluno.salaId);
        const salaNome = sala?.nome || '---';
        const salaCor = sala?.cor || '#ffffff';
        const textColor = getTextColor(salaCor);

        tbody.innerHTML += `
            <tr>
                <td>${aluno.nome}</td>
                <td><span style="background-color: ${salaCor}; color: ${textColor}; padding: 2px 6px; border-radius: 4px;">${salaNome}</span></td>
                <td class="text-danger">${faltas}</td>
                <td>${pct}%</td>
                <td>${ultimoDiaPresente}</td>
            </tr>
        `;
    });

    gerarRelatoriosSala();
}

function gerarRelatoriosSala() {
    const salas = getData("salas");
    const alunos = getData("alunos");
    const presencas = getData("presencas");
    const tbody = document.getElementById("tabelaRelatoriosSala");

    if (!tbody) return;
    tbody.innerHTML = "";

    salas.forEach(sala => {
        const alunosSala = alunos.filter(aluno => aluno.salaId == sala.id);
        const estatisticas = alunosSala.map(aluno => {
            const registros = presencas.filter(p => p.alunoId == aluno.id);
            const totalPresencas = registros.filter(r => r.historico[r.historico.length - 1].presente).length;
            const totalDias = registros.length;
            const percentual = totalDias > 0 ? (totalPresencas / totalDias) * 100 : 0;
            return { aluno, percentual };
        });

        const media = alunosSala.length > 0 ? estatisticas.reduce((sum, item) => sum + item.percentual, 0) / alunosSala.length : 0;
        const melhorAluno = estatisticas.sort((a, b) => b.percentual - a.percentual)[0];

        const textColor = getTextColor(sala.cor || '#ffffff');

        tbody.innerHTML += `
            <tr>
                <td><span style="background-color: ${sala.cor || '#ffffff'}; color: ${textColor}; padding: 2px 6px; border-radius: 4px;">${sala.nome}</span></td>
                <td>${alunosSala.length}</td>
                <td>${alunosSala.length > 0 ? media.toFixed(0) + '%' : '---'}</td>
                <td>${melhorAluno ? `${melhorAluno.aluno.nome} (${melhorAluno.percentual.toFixed(0)}%)` : '---'}</td>
            </tr>
        `;
    });
}

function exportarRelatoriosJSON() {
    const alunos = getData("alunos");
    const presencas = getData("presencas");
    const salas = getData("salas");

    const relatorios = alunos.map(aluno => {
        const sala = salas.find(s => s.id == aluno.salaId);
        const registros = presencas.filter(p => p.alunoId == aluno.id);
        const totalDias = registros.length;
        const totalPresencas = registros.filter(r => r.historico[r.historico.length - 1].presente).length;
        const diasPresente = registros.filter(r => r.historico[r.historico.length - 1].presente).map(r => r.data).sort();
        return {
            aluno: aluno.nome,
            sala: sala?.nome || '---',
            faltas: totalDias - totalPresencas,
            percPresenca: totalDias > 0 ? ((totalPresencas / totalDias) * 100).toFixed(0) + '%' : '0%',
            ultimoDiaPresente: diasPresente.length > 0 ? diasPresente[diasPresente.length - 1] : '---'
        };
    });

    downloadArquivo('relatorio-presenca.json', JSON.stringify(relatorios, null, 2), 'application/json');
}

function exportarRelatoriosCSV() {
    const alunos = getData("alunos");
    const presencas = getData("presencas");
    const salas = getData("salas");
    const linhas = [['Aluno', 'Sala', 'Faltas', '% Presença', 'Último Dia Presente']];

    alunos.forEach(aluno => {
        const sala = salas.find(s => s.id == aluno.salaId);
        const registros = presencas.filter(p => p.alunoId == aluno.id);
        const totalDias = registros.length;
        const totalPresencas = registros.filter(r => r.historico[r.historico.length - 1].presente).length;
        const diasPresente = registros.filter(r => r.historico[r.historico.length - 1].presente).map(r => r.data).sort();
        const ultimoDiaPresente = diasPresente.length > 0 ? diasPresente[diasPresente.length - 1] : '---';
        const pct = totalDias > 0 ? ((totalPresencas / totalDias) * 100).toFixed(0) + '%' : '0%';

        linhas.push([
            aluno.nome,
            sala?.nome || '---',
            `${totalDias - totalPresencas}`,
            pct,
            ultimoDiaPresente
        ]);
    });

    const conteudo = linhas.map(linha => linha.map(escapeCSV).join(',')).join('\r\n');
    downloadArquivo('relatorio-presenca.csv', conteudo, 'text/csv;charset=utf-8;');
}

function escapeCSV(valor) {
    return `"${String(valor).replace(/"/g, '""')}"`;
}

function downloadArquivo(nome, conteudo, tipo) {
    const blob = new Blob([conteudo], { type: tipo });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nome;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// __________  7. Inicialização __________
function atualizarSelects() {
    const salas = getData("salas");
    const ids = ["selectSala", "filtroSala"];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = `<option value="" selected disabled>Selecione uma sala</option>`;
            salas.forEach(s => el.innerHTML += `<option value="${s.id}">${s.nome}</option>`);
        }
    });
}

// Evento para atualizar relatório ao mudar de aba
document.addEventListener('shown.bs.tab', (e) => {
    if (e.target.id.includes('relatorios')) gerarRelatorios();
});

// Execução inicial
atualizarSelects();
listarAlunosGeral();
listarSalas();