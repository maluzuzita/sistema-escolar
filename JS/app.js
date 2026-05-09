/* ==================================  Local Storage ============================*/
/* função responsável por buscar os dados na local Storage */
const getData = (key) => JSON.parse(localStorage.getItem(key)) || [];
/* função responsável por incluir novos dados na local Storage */
const setData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

/* ================================== SALAS ===================================== */
function criarSala() {
    /* Pega o elemento input com id nomeSala */
    const nome = document.getElementById("nomeSala").value.trim();

    /* Verifica se o nome que foi inserido é válido */
    if (!nome) return alert("Digite um nome válido!");

    /* cria a constante e armazena os dados da local Storage*/
    const salas = getData("salas");
    /* Alimenta o Array de salas com o novo registro */
    salas.push({ id: Date.now(), nome });

    /* Inclui no local Storage o novo valor substituindo o antigo */
    setData("salas", salas);

    /* Atualiza o select do cadastro alunos */
    atualizarSelectSala();
    /* Atualiza o select do registro de chamada */
    atualizarFiltroSala();
}

/* ======================== SELECTS ====================================== */
function atualizarSelectSala() {
    /* cria a constante e salva o valor buscado na local Storage */
    const salas = getData("salas");
    /* Pega o select com id selectSala */
    const select = document.getElementById("selectSala");

    /* inclui o HTML option dentro do select */
    select.innerHTML = `<option value="" selected disabled>Selecione uma sala</option>`;
    /* inclui um option para cada elemento do local Storage */
    salas.forEach(element => {
        select.innerHTML += `<option value="${element.id}">${element.nome}</option>`
    });
}

function atualizarFiltroSala() {
    /* cria a constante e salva o valor buscado na local Storage */
    const salas = getData("salas");
    /* Pega o select com id filtroSala */
    const select = document.getElementById("filtroSala");

    /* inclui o HTML option dentro do select */
    select.innerHTML = `<option value="" selected disabled>Selecione uma sala</option>`;
    /* inclui um option para cada elemento do local Storage */
    salas.forEach(element => {
        select.innerHTML += `<option value="${element.id}">${element.nome}</option>`
    });
}
/* ========================== ALUNO ======================================= */
function cadastrarAlunos() {
    /* pega elemento valor do input com id nomeAluno */
    const nome = document.getElementById("nomeAluno").value;
    /* pega elemento valor do select com id selectSala */
    const selectId = document.getElementById("selectSala").value;

    /* verifica se o nome foi preenchido corretamente */
    if (!nome.trim()) return alert("Digite um nome válido");

    /* Verificar se a sala foi selecionada */
    if (!selectId) return alert("A sala deve ser solicitada");

    /* cria constante que guarda valores do local Storage */
    const alunos = getData("alunos");

    /* inclui no array os dados do novo aluno registrado */
    alunos.push({ id: Date.now(), nome, selectId });

    /* Atualiza os dados da local Storage */
    setData("alunos", alunos);

    /* função que atualiza a lista de alunos */
    listarAlunos();
}

function listarAlunos() {
    /* busca dados do local Storage dos alunos */
    const alunos = getData("alunos");
    /* busca dados do local Storage das salas */
    const salas = getData("salas");
    /* busca elemento ul com id listaAlunos */
    const lista = document.getElementById("listaAlunos");

    /* limpa HTML dentro da lista */
    lista.innerHTML = ``;
    /* constrói a lista com os dados do local Storage */
    alunos.forEach(a => {
        const sala = salas.find(s => s.id == a.selectId);
        lista.innerHTML += `
            <li class="list-group-item">
                ${a.nome}
                <span class="badge bg-secondary">${sala?.nome || 'sem sala'}</span>
            </li>
        `;
    });
}

/* ============================== CHAMADAS ==================================== */
function carregarChamada() {
    /* busca dados do local Storage dos alunos */
    const alunos = getData("alunos");
    /* busca dados do local Storage das presenças */
    const presencas = getData("presencas");

    /* busca elemento select com id filtroSala */
    const salaId = document.getElementById("filtroSala").value;
    /* busca elemento input com id dataChamada */
    const data = document.getElementById("dataChamada").value;
    /* busca elemento div com id chamada */
    const container = document.getElementById("chamada");

    /* verifica se a sala não foi selecionada */
    if (!salaId) return alert("Preencha qual é a sala");
    /* verifica se a data foi preencida */
    if (!data) return alert("Preencha a data da chamada");

    /* Filtra o array alunos com os dados dos alunos que possuem selectId igual ao salaId */
    const alunosSala = alunos.filter(a => a.selectId == salaId);

    container.innerHTML = ``;

    alunosSala.forEach(a => {
        const registro = presencas.find(p => p.alunoId == a.id && p.data == data);

        const checked = registro?.presente ? "checked" : "";
        const classe = registro ? (registro.presente) ? "presente" : "ausente" : "";

        container.innerHTML += `
            <div class="d-flex justify-content-between align-items-center border p-2 mb-2 rounded ${classe}">
                ${a.nome}
                <input type="checkbox" ${checked} onchange="marcarPresenca(${a.id}, this)">
            </div>
        `;
    });
}

/* ============================= PRESENÇA ===================================*/

function marcarPresenca(alunoId, checkbox){
    /* cria constante e pega o elemento com id dataChamada */
    const data = document.getElementById("dataChamada").value;

    /* cria variável local e pega os dados das presenças no local Storage */
    let presencas = getData("presencas");

    /* busca as presenças existentes para o aluno na determinada data */
    const existente = presencas.find(p => p.alunoId == alunoId && p.data == data);

    /* Aplica a presença */
    if(existente) {
        existente.presente = checkbox.checked;
    } else {
        presencas.push({
            alunoId,
            data,
            presente:checkbox.checked
        });
    }

    /* Atualizar presenças no local Storage */
    setData("presencas", presencas);

    /* pegando elementos parentes ao passado no paramentro */
    const linha = checkbox.parentElement;
    /* Remoção da classe com o nome presente e ausente */
    linha.classList.remove("presente", "ausente");
    /* adiciona a classe baseada na presença ou não */
    linha.classList.add(checkbox.checked ? "presente" : "ausente");

}

/* ============================ INIT ======================================== */
atualizarSelectSala();
atualizarFiltroSala();
listarAlunos();