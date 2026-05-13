// __________  1. Funções de Storage (Persistência) __________
/**
 * REQUISITO 6: Persistência de Dados via LocalStorage.
 * Estas funções centralizam o acesso ao banco de dados do navegador,
 * garantindo que a estrutura JSON seja preservada e os dados não sejam
 * corrompidos ou perdidos durante o carregamento/atualização da página.
 */

// Busca dados: Converte a string do localStorage de volta para Array/Objeto.
// Retorna um array vazio [] caso a chave não exista, evitando erros de execução.
const getData = (key) => JSON.parse(localStorage.getItem(key)) || [];

// Salva dados: Converte o Array/Objeto em string JSON para armazenamento físico.
const setData = (key, data) => localStorage.setItem(key, JSON.stringify(data));


// __________  2. Funções de UI (Interface e Modais) __________
/**
 * ----- REQUISITO 7: Interface e Feedback Visual.
 * Substitui o uso de 'alert()' nativo por componentes do Bootstrap 5.
 * Proporciona uma experiência profissional (UX) e garante que o sistema
 * seja visualmente amigável e responsivo.
 */

function exibirAlerta(titulo, mensagem) {
    // Vincula dinamicamente o conteúdo ao HTML do modal padrão
    document.getElementById("tituloAlerta").innerText = titulo;
    document.getElementById("mensagemAlerta").innerText = mensagem;
    
    const elementoModal = document.getElementById('modalAlert');
    
    // Verificação de segurança: garante que o elemento existe no DOM antes de tentar exibir
    if (elementoModal) {
        // Instancia o modal do Bootstrap via JavaScript
        const modalBootstrap = new bootstrap.Modal(elementoModal);
        modalBootstrap.show(); // Exibe o feedback visual ao usuário
    }
}

/**
 * ----- REQUISITO 7: Interface e Feedback (Confirmação Assíncrona).
 * Esta função substitui o 'confirm()' nativo do navegador.
 * Ela utiliza uma Promise para "pausar" a execução do código até que o usuário
 * clique em Sim ou Não no modal do Bootstrap.
 */
function abrirModalConfirm(titulo, mensagem) {
    return new Promise((resolve) => {
        // Seleção dos elementos do DOM para manipulação
        const modalEl = document.getElementById('modalConfirm');
        const confirmBody = document.getElementById('confirmBody');
        const confirmYesBtn = document.getElementById('confirmYesBtn');
        const confirmNoBtn = document.getElementById('confirmNoBtn');
        
        // Inicializa o componente de Modal do Bootstrap
        const modal = new bootstrap.Modal(modalEl);
        let resolved = false; // Flag para evitar múltiplas resoluções da Promise

        // Define a mensagem dinâmica passada por parâmetro
        confirmBody.innerText = mensagem;
        modal.show();

        /**
         * ----- FUNÇÃO DE LIMPEZA (Cleanup):
         * Extremamente importante para evitar vazamento de memória (memory leak).
         * Remove os ouvintes de evento após o fechamento do modal para que
         * cliques futuros não acumulem funções na memória.
         */
        const cleanup = () => {
            confirmYesBtn.removeEventListener('click', onYes);
            confirmNoBtn.removeEventListener('click', onNo);
            modalEl.removeEventListener('hidden.bs.modal', onHidden);
        };

        // Caso o usuário confirme (Sim)
        const onYes = () => {
            resolved = true;
            cleanup();
            modal.hide();
            resolve(true); // Retorna 'true' para quem chamou a função
        };

        // Caso o usuário recuse ou feche (Não)
        const onNo = () => {
            resolved = true;
            cleanup();
            modal.hide();
            resolve(false); // Retorna 'false'
        };

        // Caso o modal seja fechado clicando fora ou na tecla Esc
        const onHidden = () => {
            if (!resolved) {
                resolve(false);
            }
            cleanup();
        };

        // Adiciona os ouvintes de evento para as ações do usuário
        confirmYesBtn.addEventListener('click', onYes);
        confirmNoBtn.addEventListener('click', onNo);
        modalEl.addEventListener('hidden.bs.modal', onHidden);
    });
    // Essa função é gigantesca e possui um motivo para existir sim! Ela não é aleatória.
    // Eu precisei fazer isso para aplicar um modal no mesmo estilo que os modais do bootstrap,
    // mas que possuem um input para o usuário escrever. Ou seja, utilizei isso na aba 
    // de registro de presenças para justificar modificações no sistema.
}

/**
 * ----- REQUISITO 7: Interface e Feedback Visual (Acessibilidade).
 * Esta função de auxílio garante que o texto dentro das etiquetas coloridas (Badges)
 * seja sempre legível, independentemente da cor da sala escolhida.
 * Ela calcula o contraste para decidir se a fonte deve ser preta ou branca.
 */
function getTextColor(hex) {
    // Limpeza da string: Remove o caractere '#' caso ele tenha sido enviado
    hex = hex.replace('#', '');

    // Conversão de Base Hexadecimal para Decimal (RGB)
    // Extrai os pares de caracteres e os transforma em valores de 0 a 255
    const r = parseInt(hex.substr(0, 2), 16); // Red (Vermelho)
    const g = parseInt(hex.substr(2, 2), 16); // Green (Verde)
    const b = parseInt(hex.substr(4, 2), 16); // Blue (Azul)

    // ^^^^ Para calcular o brilho e decidir a cor do texto, não podemos 
    // fazer contas matemáticas diretamente com letras e símbolos 
    // (como o "A" ou "F" do Hexa). Por isso, usamos esse código 
    // para "fatiar" a etiqueta em três partes e converter 
    // cada pedaço em um número decimal comum (de 0 a 255). 
    // Com esses números em mãos, o sistema consegue somar e pesar 
    // as cores para descobrir se o fundo é claro ou escuro.

    /**
     * CÁLCULO DE LUMINOSIDADE (Fórmula de brilho YIQ):
     * Aplica pesos diferentes para cada cor, pois o olho humano percebe 
     * o verde como mais brilhante que o azul.
     */
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // REGRA DE UI: Se o brilho for maior que a metade (128), a cor de fundo é clara.
    // Portanto, retorna texto PRETO. Caso contrário, retorna texto BRANCO.
    return brightness > 128 ? '#000000' : '#ffffff';
}

/**
 * ----- REQUISITO 7: Interface Profissional (Substituto do prompt nativo).
 * Esta função cria uma caixa de diálogo dinâmica para entrada de texto.
 * Ela retorna uma Promise que entrega o valor digitado ou 'null' se cancelado.
 */
function abrirModalInput(titulo, mensagem, valorInicial = '', placeholder = '') {
    return new Promise((resolve) => {
        // Seleção dos componentes de interface do modal
        const modalEl = document.getElementById('modalInput');
        const tituloInput = document.getElementById('tituloInput');
        const inputBody = document.getElementById('inputBody');
        const inputField = document.getElementById('inputField');
        const confirmBtn = document.getElementById('inputConfirmBtn');
        const cancelBtn = document.getElementById('inputCancelBtn');
        const modal = new bootstrap.Modal(modalEl);
        let resolved = false;

        // Configuração dinâmica dos textos e campos
        tituloInput.innerText = titulo;
        inputBody.innerText = mensagem;
        inputField.value = valorInicial || ''; // Preenche se for uma edição
        inputField.placeholder = placeholder || '';

        modal.show();
        
        // FOCO AUTOMÁTICO: Melhora a experiência, permitindo digitar imediatamente
        inputField.focus();

        /**
         * CLEANUP: Limpa os ouvintes de eventos.
         * Essencial para que o sistema não tente "confirmar" uma ação antiga
         * na próxima vez que o modal for aberto.
         */
        const cleanup = () => {
            confirmBtn.removeEventListener('click', onConfirm);
            cancelBtn.removeEventListener('click', onCancel);
            inputField.removeEventListener('keydown', onKeyDown);
            modalEl.removeEventListener('hidden.bs.modal', onHidden);
        };

        // Ação de Confirmar: Resolve a Promise com o texto limpo (trim)
        const onConfirm = () => {
            resolved = true;
            cleanup();
            modal.hide();
            resolve(inputField.value.trim()); 
        };

        // Ação de Cancelar
        const onCancel = () => {
            resolved = true;
            cleanup();
            modal.hide();
            resolve(null);
        };

        // Trata o fechamento inesperado do modal (clique fora ou tecla ESC)
        const onHidden = () => {
            if (!resolved) resolve(null);
            cleanup();
        };

        /**
         * MELHORIA DE UX: Atalho de teclado.
         * Permite que o usuário confirme a operação apenas apertando 'Enter',
         * simulando o comportamento de um formulário real.
         */
        const onKeyDown = (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                onConfirm();
            }
        };

        // Adiciona os ouvintes de evento aos botões e ao teclado
        confirmBtn.addEventListener('click', onConfirm);
        cancelBtn.addEventListener('click', onCancel);
        inputField.addEventListener('keydown', onKeyDown);
        modalEl.addEventListener('hidden.bs.modal', onHidden);
    });
}

// __________  3. Regras de Negócio: Salas __________
/**
 * ----- REQUISITO 1 e 5: Gestão de Salas e Validação Forte.
 * Esta função é responsável por cadastrar novas unidades (salas) no sistema,
 * garantindo que os dados inseridos sejam válidos e únicos.
 */
function criarSala() {
    // Captura dos elementos de entrada (Input de texto e Seletor de cor)
    const inputSala = document.getElementById("nomeSala");
    const inputCor = document.getElementById("corSala");
    
    // O uso do .trim() remove espaços inúteis no início e fim do nome
    const nome = inputSala.value.trim();
    const cor = inputCor.value;

    /**
     * ----- REQUISITO 5: Validação Forte (Campo Vazio).
     * Impede que o sistema aceite salas sem nome. 
     * O 'return' interrompe a função imediatamente para evitar que o código 
     * continue a execução e salve um dado inválido.
     */
    if (!nome) {
        exibirAlerta("Campo Vazio", "Por favor, digite um nome para a sala.");
        return; 
    }

    // Recupera a lista atual de salas para realizar a verificação de duplicidade
    const salas = getData("salas");
    
    /**
     * ----- REQUISITO 1: Regra de Unicidade de Nomes.
     * O sistema percorre o array de salas existentes.
     * O uso de .toLowerCase() é crucial para que "SALA A" e "sala a" 
     * sejam consideradas o mesmo nome, evitando duplicatas por erro de digitação.
     */
    const salaExiste = salas.find(s => s.nome.toLowerCase() === nome.toLowerCase());
    if (salaExiste) {
        exibirAlerta("Erro de Cadastro", "Esta sala já existe no sistema.");
        return;
    }
    
    /**
     * PERSISTÊNCIA E ESTRUTURA:
     * O id é gerado via Date.now() para garantir um identificador único numérico.
     * O objeto é inserido no array e salvo imediatamente no localStorage.
     */
    salas.push({ id: Date.now(), nome, cor });
    setData("salas", salas);
    
    // Limpeza da interface após o sucesso
    inputSala.value = "";
    inputCor.value = "#007bff"; // Reseta para a cor padrão (Azul Bootstrap)
    
    exibirAlerta("Sucesso!", `A sala "${nome}" foi criada.`);
    
    // ----- REQUISITO 7: Atualiza a interface (listas e menus suspensos) em tempo real
    atualizarSelects();
    listarSalas();
}

// __________  4. Regras de Negócio: Alunos __________
/**
 * ----- REQUISITO 1 e 5: Gestão de Alunos e Integridade Relacional.
 * Esta função garante que todo aluno esteja vinculado a uma sala válida
 * e impede a existência de registros duplicados no mesmo contexto escolar.
 */
function cadastrarAluno() {
    // Captura o nome do aluno e o ID da sala selecionada no formulário
    const nome = document.getElementById("nomeAluno").value.trim();
    const salaId = document.getElementById("selectSala").value;

    /**
     * ----- REQUISITO 5: Validação Forte (Campo Vazio e Vínculo Obrigatório).
     * Segundo os requisitos, "um aluno não pode existir sem sala".
     * Esta verificação impede o cadastro se o nome estiver vazio ou se
     * nenhuma sala tiver sido selecionada no menu suspenso.
     */
    if (!nome || !salaId) {
        exibirAlerta("Erro de cadastro", "Preencha o nome e selecione uma sala.");
        return; // Interrompe o processo para garantir a integridade dos dados
    }

    // Recupera a base de dados de alunos do localStorage
    const alunos = getData("alunos");

    /**
     * ----- REQUISITO 1: Evitar Duplicidade.
     * Verifica se já existe um aluno com o mesmo nome DENTRO da mesma sala.
     * Nota: Permite nomes iguais em salas diferentes (cenário real), mas
     * bloqueia duplicatas idênticas na mesma turma para evitar confusão no diário.
     */
    const alunoExiste = alunos.find(a => 
        a.nome.toLowerCase() === nome.toLowerCase() && a.salaId === salaId
    );
    
    if (alunoExiste) {
        exibirAlerta("Erro de cadastro", "Este aluno já existe nesta sala.");
        return;
    }

    /**
     * ESTRUTURA DE DADOS:
     * O aluno é salvo como um objeto contendo:
     * - id: Identificador único temporal.
     * - nome: Nome higienizado (.trim).
     * - salaId: Chave que conecta o aluno à sua sala.
     */
    alunos.push({ id: Date.now(), nome, salaId });
    setData("alunos", alunos);

    // Limpa o campo de entrada para facilitar o próximo cadastro (UX)
    document.getElementById("nomeAluno").value = "";
    
    // ----- REQUISITO 7: Atualiza a listagem visual imediatamente após o cadastro
    listarAlunosGeral();
    
    exibirAlerta("Sucesso!", `O aluno "${nome}" foi cadastrado.`);
}

/**
 * ----- REQUISITO 1 e 7: Listagem Organizada e Interface Dinâmica.
 * Esta função percorre o banco de dados de alunos e "desenha" a lista na tela,
 * cruzando informações de alunos com suas respectivas salas.
 */
function listarAlunosGeral() {
    // Busca as listas atualizadas do localStorage
    const alunos = getData("alunos");
    const salas = getData("salas");
    const lista = document.getElementById("listaAlunos");

    // Safety check: evita erros se a função for chamada em uma página que não contém a lista
    if (!lista) return;

    /**
     * ----- REQUISITO 7: Interface Limpa.
     * Limpa o conteúdo atual da lista antes de reconstruí-la. 
     * Isso impede que os itens se dupliquem visualmente ao cadastrar um novo aluno.
     */
    lista.innerHTML = "";

    alunos.forEach(a => {
        /**
         * LÓGICA DE RELACIONAMENTO:
         * Para cada aluno, buscamos o objeto da sala correspondente (via salaId).
         * O operador '?.' evita erros caso a sala tenha sido removida.
         */
        const sala = salas.find(s => s.id == a.salaId);
        const salaNome = sala?.nome || 'Sem sala';
        const salaCor = sala?.cor || '#ffffff';
        
        // Aplica a lógica de contraste para garantir legibilidade no nome da sala
        const textColor = getTextColor(salaCor);

        /**
         * CONSTRUÇÃO DO DOM (TEMPLATE LITERALS):
         * Gera o código HTML usando classes do Bootstrap (list-group-item, d-flex, etc.)
         * para garantir a responsividade e o alinhamento correto dos botões de ação.
         */
        lista.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <strong>${a.nome}</strong><br>
                    <small>
                        <span style="background-color: ${salaCor}; color: ${textColor}; padding: 2px 6px; border-radius: 4px;">
                            ${salaNome}
                        </span>
                    </small>
                </div>
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-primary" onclick="editarAluno(${a.id})">
                        <i class="bi bi-pencil-fill me-1"></i>Editar
                    </button>
                    <button class="btn btn-outline-danger" onclick="removerAluno(${a.id})">
                        <i class="bi bi-trash-fill me-1"></i>Excluir
                    </button>
                </div>
            </li>
        `;
    });
}

/**
 * REQUISITO 1 e 7: Listagem de Salas.
 * Similar à listagem de alunos, esta função renderiza dinamicamente as salas,
 * utilizando a cor escolhida pelo usuário para personalizar a interface.
 */
function listarSalas() {
    const salas = getData("salas");
    const lista = document.getElementById("listaSalas");

    if (!lista) return;

    lista.innerHTML = "";
    salas.forEach(s => {
        // REQUISITO 7: Aplica o contraste de texto dinâmico para garantir a acessibilidade
        const textColor = getTextColor(s.cor || '#ffffff');
        
        lista.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <span style="background-color: ${s.cor || '#ffffff'}; color: ${textColor}; padding: 2px 6px; border-radius: 4px;">
                    ${s.nome}
                </span>
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-primary" onclick="editarSala(${s.id})">
                        <i class="bi bi-pencil-fill me-1"></i>Editar
                    </button>
                    <button class="btn btn-outline-danger" onclick="removerSala(${s.id})">
                        <i class="bi bi-trash-fill me-1"></i>Excluir
                    </button>
                </div>
            </li>
        `;
    });
}

/**
 * ----- REQUISITO 1 e 5: Edição de Sala com Validação.
 * Esta função utiliza um modal específico para edição, garantindo que
 * o usuário não altere uma sala para um nome vazio ou já existente.
 */
async function editarSala(id) {
    const salas = getData("salas");
    const sala = salas.find(s => s.id == id);
    if (!sala) return;

    return new Promise((resolve) => {
        const modalEl = document.getElementById('modalEditarSala');
        const editNomeSala = document.getElementById('editNomeSala');
        const editCorSala = document.getElementById('editCorSala');
        const confirmarBtn = document.getElementById('confirmarEditarSalaBtn');

        // Preenche o modal com os dados atuais da sala (Facilita a edição)
        editNomeSala.value = sala.nome;
        editCorSala.value = sala.cor || '#007bff';

        const modal = new bootstrap.Modal(modalEl);
        modal.show();

        const onConfirm = () => {
            const novoNome = editNomeSala.value.trim();
            const novaCor = editCorSala.value;

            /**
             * ----- REQUISITO 5: Validação de campo vazio na edição.
             */
            if (!novoNome) {
                exibirAlerta("Nome inválido", "O nome da sala não pode ficar vazio.");
                return;
            }

            /**
             * ----- REQUISITO 1: Verificação de Duplicidade.
             * Garante que o novo nome não coincida com outra sala já cadastrada.
             * O trecho 's.id != id' ignora a própria sala que está sendo editada.
             */
            const salaExiste = salas.find(s => s.nome.toLowerCase() === novoNome.toLowerCase() && s.id != id);
            if (salaExiste) {
                exibirAlerta("Erro de cadastro", "Já existe outra sala com esse nome.");
                return;
            }

            // Atualização dos dados no objeto e persistência
            sala.nome = novoNome;
            sala.cor = novaCor;
            setData("salas", salas);

            /**
             * ----- REQUISITO 7: Sincronização da Interface.
             * Atualiza selects, a lista de salas e a lista de alunos (pois a cor/nome da sala mudou).
             */
            atualizarSelects();
            listarSalas();
            listarAlunosGeral();
            
            exibirAlerta("Sucesso!", `A sala foi atualizada.`);
            modal.hide();
            resolve();
        };

        confirmarBtn.onclick = onConfirm;

        // Limpa referências ao fechar o modal para evitar bugs de memória
        modalEl.addEventListener('hidden.bs.modal', () => {
            confirmarBtn.onclick = null;
            resolve();
        }, { once: true });
    });
}

/**
 * ----- REQUISITO 1 e 5: Remoção Segura de Sala.
 * Esta função impede a corrupção da integridade referencial.
 * A regra de negócio é: "Um aluno não pode existir sem sala", portanto,
 * uma sala não pode ser excluída se ainda houver alunos vinculados a ela, certo?
 */
function removerSala(id) {
    const alunos = getData("alunos");
    
    /**
     * VALIDAÇÃO DE INTEGRIDADE:
     * O método .some() verifica se existe pelo menos um aluno cujo salaId 
     * seja igual ao ID da sala que se pretende remover.
     */
    const salaComAlunos = alunos.some(a => a.salaId == id);

    if (salaComAlunos) {
        // ----- REQUISITO 7: Feedback visual impeditivo
        exibirAlerta("Não é possível remover", "Remova os alunos dessa sala antes de excluí-la.");
        return; // Aborta a exclusão para evitar alunos sem sala
    }

    // Caso a sala esteja vazia, filtra o array para remover o ID correspondente
    const salas = getData("salas").filter(s => s.id != id);
    setData("salas", salas);
    
    // Sincronização total da interface
    atualizarSelects();
    listarSalas();
    exibirAlerta("Removido", "A sala foi removida com sucesso.");
}

/**
 * ----- REQUISITO 1 e 5: Edição de Aluno com Validação.
 * Esta função permite editar os dados de um aluno, vinculando-o a uma nova sala
 * se necessário, e garantindo que não haja duplicidade de nomes na mesma sala.
 */
function editarAluno(id) {
    const alunos = getData("alunos");
    const salas = getData("salas");
    const aluno = alunos.find(a => a.id == id);
    if (!aluno) return;

    // Busca elementos do modal
    const modalEl = document.getElementById('modalEditarAluno');
    const editNomeAluno = document.getElementById('editNomeAluno');
    const editSelectSala = document.getElementById('editSelectSala');
    const confirmarBtn = document.getElementById('confirmarEditarAlunoBtn');

    // Verificação de existência dos elementos
    if (!modalEl || !editNomeAluno || !editSelectSala || !confirmarBtn) {
        exibirAlerta("Erro de interface", "Elementos do modal de edição de aluno não encontrados no HTML.");
        return;
    }

    return new Promise((resolve) => {
        // Preenche campos do modal com os dados atuais
        editNomeAluno.value = aluno.nome;
        // Preenche o select de salas
        editSelectSala.innerHTML = `<option value="" disabled>Selecione uma sala</option>`;
        salas.forEach(s => editSelectSala.innerHTML += `<option value="${s.id}" ${s.id == aluno.salaId ? 'selected' : ''}>${s.nome}</option>`);

        const modal = new bootstrap.Modal(modalEl);
        modal.show();

        const onConfirm = () => {
            const novoNome = editNomeAluno.value.trim();
            const novaSalaId = editSelectSala.value;

            if (!novoNome || !novaSalaId) {
                exibirAlerta("Erro de cadastro", "Preencha o nome e selecione uma sala.");
                return;
            }

            // Evita duplicidade dentro da mesma sala
            const alunoExiste = alunos.find(a =>
                a.nome.toLowerCase() === novoNome.toLowerCase() && a.salaId == novaSalaId && a.id != id
            );
            if (alunoExiste) {
                exibirAlerta("Erro de cadastro", "Já existe este aluno nesta sala.");
                return;
            }

            // Atualiza e persiste
            aluno.nome = novoNome;
            aluno.salaId = novaSalaId;
            setData("alunos", alunos);

            // Sincroniza interface
            listarAlunosGeral();
            gerarRelatorios();

            exibirAlerta("Sucesso!", `Aluno atualizado.`);
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

/**
 * ----- REQUISITO 1 e 5: Remoção Segura de Aluno.
 * Esta função remove um aluno e todos os seus registros de presença associados.
 * A exclusão é precedida por uma confirmação do usuário.
 */
function removerAluno(id) {
    return abrirModalConfirm("Confirmação", "Deseja realmente remover este aluno?")
        .then(confirmed => {
            if (!confirmed) return;

            // Remove aluno e quaisquer registros de presença associados
            const alunos = getData("alunos").filter(a => a.id != id);
            setData("alunos", alunos);

            const presencas = getData("presencas").filter(p => p.alunoId != id);
            setData("presencas", presencas);

            listarAlunosGeral();
            gerarRelatorios();

            exibirAlerta("Removido", "O aluno foi excluído com sucesso.");
        });
}

/**
 * ----- REQUISITO 2, 3, 5 e 7: Interface de Chamada com Auditoria.
 * Esta função renderiza dinamicamente a lista de presença, cruzando dados 
 * de alunos com registros históricos para garantir que nenhuma informação seja perdida.
 */
function carregarChamada() {
    // Captura os critérios de filtragem (Sala e Data)
    const salaId = document.getElementById("filtroSala").value;
    const data = document.getElementById("dataChamada").value;
    
    // Obtém a data atual em formato ISO (AAAA-MM-DD) para validação
    const hoje = new Date().toISOString().split('T')[0];
    const container = document.getElementById("containerChamada") || document.getElementById("chamada");

    /**
     * ----- REQUISITO 5: Validação Forte (Presença sem data ou sala).
     * Impede o carregamento da lista se os parâmetros obrigatórios não forem informados.
     */
    if (!salaId || !data) {
        exibirAlerta("Erro", "Selecione a sala e a data da chamada.");
        return;
    }

    /**
     * ----- REQUISITO 3: Regra de Negócio de Tempo.
     * Bloqueia a visualização/registro de chamadas para o futuro, garantindo a
     * integridade cronológica dos dados escolares.
     */
    if (data > hoje) {
        exibirAlerta("Data inválida", "Não é possível carregar chamada para data futura.");
        return;
    }

    // Filtra apenas os alunos que pertencem à sala selecionada
    const alunos = getData("alunos").filter(a => a.salaId == salaId);
    const presencas = getData("presencas");
    
    // Limpa o container para reconstruir a lista (Requisito 7)
    container.innerHTML = "";

    alunos.forEach(a => {
        /**
         * ----- REQUISITO 2: Lógica de Histórico (Não Sobrescrever).
         * Busca se já existe um registro para o aluno nesta data.
         * O status atual é extraído da ÚLTIMA posição do array de histórico,
         * respeitando a imutabilidade dos registros anteriores.
         */
        const registro = presencas.find(p => p.alunoId == a.id && p.data == data);
        const isPresente = registro ? registro.historico[registro.historico.length - 1].presente : false;

        /**
         * ----- REQUISITO 7: Feedback Visual (Cores de Presença/Falta).
         * Define classes do Bootstrap baseadas no estado:
         * bg-success-subtle (Verde) para presença confirmada.
         * bg-danger-subtle (Vermelho) para falta registrada.
         */
        const classe = registro ? (isPresente ? 'bg-success-subtle' : 'bg-danger-subtle') : '';

        // Construção dinâmica do HTML com Bootstrap
        container.innerHTML += `
            <div class="d-flex justify-content-between align-items-center border p-3 mb-2 rounded ${classe}">
                <div>
                    <strong>${a.nome}</strong>
                </div>
                <div class="d-flex gap-2 align-items-center">
                    <span class="badge ${registro ? (isPresente ? 'bg-success' : 'bg-danger') : 'bg-secondary'}">
                        ${registro ? (isPresente ? 'Presente' : 'Ausente') : 'Sem registro'}
                    </span>
                    
                    <button class="btn btn-outline-secondary btn-sm" onclick="mostrarHistorico(${a.id}, '${data}')">
                        <i class="bi bi-clock-history me-1"></i>Histórico
                    </button>
                    
                    <input type="checkbox" ${isPresente ? "checked" : ""} onchange="marcarPresenca(${a.id}, this)">
                </div>
            </div>
        `;
    });
}

/**
 * ----- REQUISITO 2 e 3: Lógica de Presença e Auditoria (Regra de Ouro).
 * Esta função é o coração do sistema. Ela garante que cada alteração de presença
 * seja rastreável, impedindo a perda de dados originais.
 */
async function marcarPresenca(alunoId, checkbox) {
    const data = document.getElementById("dataChamada").value;
    const hoje = new Date().toISOString().split('T')[0];
    let presencas = getData("presencas");
    
    // Verifica se já existe um histórico para este aluno nesta data
    const registro = presencas.find(p => p.alunoId == alunoId && p.data == data);
    const novoStatus = checkbox.checked;

    /**
     * ----- REQUISITO 5: Validação de Segurança.
     * Impede registros "fantasmas" sem uma data definida no calendário.
     */
    if (!data) {
        exibirAlerta("Erro", "Selecione a data antes de marcar a presença.");
        checkbox.checked = !novoStatus; // Reverte o visual do checkbox
        return;
    }

    /**
     * ----- REQUISITO 3: Regra de Negócio de Tempo.
     * Bloqueia lançamentos para o futuro.
     */
    if (data > hoje) {
        exibirAlerta("Data inválida", "Não é possível registrar presença para data futura.");
        checkbox.checked = !novoStatus;
        return;
    }

    /**
     * ----- REQUISITO 3: Regra de Negócio "Nível Empresa".
     * Se a data da chamada for anterior a hoje (retroativa), o sistema
     * obriga o professor a fornecer uma justificativa para a alteração.
     * Usa 'await' para esperar a resposta do modal customizado.
     */
    let justificativa = "";
    if (data < hoje) {
        try {
            justificativa = await solicitarJustificativa();
            if (!justificativa.trim()) {
                throw new Error("Sem justificativa");
            }
        } catch {
            // Se o usuário cancelar ou não digitar nada, a ação é anulada
            checkbox.checked = !novoStatus;
            return;
        }
    }

    /**
     * ----- REQUISITO 2: Estrutura de Histórico (NÃO SOBRESCREVER).
     * Criamos um objeto 'log' que registra o estado, o momento exato (timestamp)
     * e o motivo da mudança.
     */
    const log = {
        presente: novoStatus,
        timestamp: new Date().toLocaleString(),
        justificativa
    };

    /**
     * LÓGICA DE PERSISTÊNCIA:
     * Se já existe registro, apenas adicionamos o novo log ao array 'historico'.
     * Se é a primeira vez no dia, criamos o objeto base.
     * Isso cumpre o requisito de manter TODAS as versões da presença.
     */
    if (registro) {
        registro.historico.push(log);
    } else {
        presencas.push({
            alunoId,
            data,
            historico: [log]
        });
    }

    // Salva no localStorage e atualiza a interface para mostrar o feedback visual
    setData("presencas", presencas);
    
    const salaId = document.getElementById("filtroSala").value;
    const dataAtual = document.getElementById("dataChamada").value;
    if (salaId && dataAtual) {
        carregarChamada(); // Recarrega para aplicar as cores verde/vermelho (REQ 7)
    }
}

/**
 * ----- REQUISITO 3 e 7: Captura de Justificativa Obrigatória.
 * Esta função utiliza uma Promise para pausar a execução do código até que o
 * usuário forneça um motivo para a alteração da chamada retroativa.
 */
function solicitarJustificativa() {
    return new Promise((resolve, reject) => {
        // Seleção dos elementos do modal específico de justificativa
        const modalEl = document.getElementById('modalJustificativa');
        const texto = document.getElementById('textoJustificativa');
        const confirmarButton = document.getElementById('confirmarJustificativaBtn');
        const modal = new bootstrap.Modal(modalEl);
        let respostaRegistrada = false;

        // Limpa o campo de texto e exibe o modal (Interface Requisito 7)
        texto.value = "";
        modal.show();

        /**
         * CLEANUP: Função de limpeza.
         * Remove todos os ouvintes de eventos para evitar "vazamento de memória"
         * ou execuções duplicadas em chamadas futuras.
         */
        const cleanup = () => {
            modalEl.removeEventListener('hidden.bs.modal', onHidden);
            confirmarButton.removeEventListener('click', confirmar);
            texto.removeEventListener('keydown', onEnter);
        };

        /**
         * AÇÃO DE CONFIRMAR:
         * Valida se o campo não está vazio (Requisito 5) e resolve a Promise.
         */
        const confirmar = () => {
            const valor = texto.value.trim();
            if (!valor) {
                exibirAlerta("Justificativa obrigatória", "Digite uma justificativa para a alteração.");
                return; // Impede o fechamento se não houver texto
            }
            
            respostaRegistrada = true;
            resolve(valor); // Retorna a justificativa para a função marcarPresenca
            modal.hide();
        };

        /**
         * TRATAMENTO DE FECHAMENTO:
         * Se o modal for fechado (pelo 'X', ESC ou clicando fora) sem confirmar,
         * a Promise é rejeitada, cancelando a alteração da presença.
         */
        const onHidden = () => {
            if (!respostaRegistrada) reject();
            cleanup();
        };

        /**
         * UX (Requisito 7): Atalho Enter.
         * Permite confirmar a justificativa rapidamente sem usar o mouse.
         */
        const onEnter = (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                confirmar();
            }
        };

        // Adiciona os escutadores de eventos
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

/**
 * REQUISITO 4: Relatório Individual de Alunos.
 * Consolida a vida escolar de cada aluno, calculando faltas, 
 * percentual de assiduidade e identificando o último dia de presença.
 */
function gerarRelatorios() {
    const alunos = getData("alunos");
    const presencas = getData("presencas");
    const salas = getData("salas");
    const tbody = document.getElementById("tabelaRelatorios");

    if (!tbody) return;
    tbody.innerHTML = ""; // Limpa a tabela antes de renderizar (REQ 7)

    alunos.forEach(aluno => {
        // Filtra todos os dias em que houve chamada para este aluno
        const registros = presencas.filter(p => p.alunoId == aluno.id);
        const totalDias = registros.length;
        
        /**
         * LÓGICA DE AUDITORIA:
         * Filtra as presenças confirmadas olhando sempre para o ÚLTIMO 
         * registro do histórico (versão mais atual da chamada).
         */
        const totalPresencas = registros.filter(r => 
            r.historico[r.historico.length - 1].presente
        ).length;

        // Cálculos matemáticos conforme o REQUISITO 4
        const faltas = totalDias - totalPresencas; 
        const pct = totalDias > 0 ? ((totalPresencas / totalDias) * 100).toFixed(0) : 0;

        /**
         * Identificação do Último Dia Presente:
         * Mapeia as datas onde o status final foi 'Presente' e ordena cronologicamente.
         */
        const diasPresente = registros
            .filter(r => r.historico[r.historico.length - 1].presente)
            .map(r => r.data)
            .sort();
        const ultimoDiaPresente = diasPresente.length > 0 ? diasPresente[diasPresente.length - 1] : '---';

        // Busca dados da sala para exibir a etiqueta colorida (REQ 7)
        const sala = salas.find(s => s.id == aluno.salaId);
        const salaNome = sala?.nome || '---';
        const salaCor = sala?.cor || '#ffffff';
        const textColor = getTextColor(salaCor);

        // Renderização da linha na tabela de relatórios
        tbody.innerHTML += `
            <tr>
                <td>${aluno.nome}</td>
                <td><span style="background-color: ${salaCor}; color: ${textColor}; padding: 2px 6px; border-radius: 4px;">${salaNome}</span></td>
                <td class="text-danger"><strong>${faltas}</strong></td>
                <td>${pct}%</td>
                <td>${ultimoDiaPresente}</td>
            </tr>
        `;
    });

    // Chama a função secundária para atualizar os dados por turma
    gerarRelatoriosSala();
}

/**
 * ----- REQUISITO 4: Relatório Consolidado por Sala.
 * Calcula a média de frequência da turma e identifica o aluno com melhor desempenho.
 */
function gerarRelatoriosSala() {
    const salas = getData("salas");
    const alunos = getData("alunos");
    const presencas = getData("presencas");
    const tbody = document.getElementById("tabelaRelatoriosSala");

    if (!tbody) return;
    tbody.innerHTML = "";

    salas.forEach(sala => {
        // Filtra os alunos que pertencem a esta sala (Relacionamento de dados)
        const alunosSala = alunos.filter(aluno => aluno.salaId == sala.id);
        
        // Cria um array de objetos com o percentual individual de cada aluno da sala
        const estatisticas = alunosSala.map(aluno => {
            const registros = presencas.filter(p => p.alunoId == aluno.id);
            const totalPresencas = registros.filter(r => r.historico[r.historico.length - 1].presente).length;
            const totalDias = registros.length;
            const percentual = totalDias > 0 ? (totalPresencas / totalDias) * 100 : 0;
            return { aluno, percentual };
        });

        /**
         * Média da Sala:
         * Soma todos os percentuais individuais e divide pelo total de alunos.
         */
        const media = alunosSala.length > 0 
            ? estatisticas.reduce((sum, item) => sum + item.percentual, 0) / alunosSala.length 
            : 0;

        /**
         * Ranking (Melhor Aluno):
         * Ordena do maior percentual para o menor e pega o primeiro da lista.
         */
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

/**
 * REQUISITO DE PORTABILIDADE: Exportação para JSON.
 * Converte os dados processados em um formato estruturado (JSON), ideal para 
 * backups ou integração com outros sistemas de TI.
 */
function exportarRelatoriosJSON() {
    const alunos = getData("alunos");
    const presencas = getData("presencas");
    const salas = getData("salas");

    // Mapeia os dados brutos para o formato final de relatório
    const relatorios = alunos.map(aluno => {
        const sala = salas.find(s => s.id == aluno.salaId);
        const registros = presencas.filter(p => p.alunoId == aluno.id);
        const totalDias = registros.length;
        
        // Mantém a regra de considerar apenas a última alteração do histórico
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

    // Gera o arquivo para download. O 'null, 2' serve para formatar o JSON (indentação)
    downloadArquivo('relatorio-presenca.json', JSON.stringify(relatorios, null, 2), 'application/json');
}

/**
 * REQUISITO DE PORTABILIDADE: Exportação para CSV (Excel).
 * Transforma os dados em uma tabela de texto separada por vírgulas, 
 * permitindo que os professores abram os relatórios diretamente em planilhas.
 */
function exportarRelatoriosCSV() {
    const alunos = getData("alunos");
    const presencas = getData("presencas");
    const salas = getData("salas");
    
    // Define o cabeçalho das colunas do arquivo CSV
    const linhas = [['Aluno', 'Sala', 'Faltas', '% Presença', 'Último Dia Presente']];

    alunos.forEach(aluno => {
        const sala = salas.find(s => s.id == aluno.salaId);
        const registros = presencas.filter(p => p.alunoId == aluno.id);
        const totalDias = registros.length;
        const totalPresencas = registros.filter(r => r.historico[r.historico.length - 1].presente).length;
        const diasPresente = registros.filter(r => r.historico[r.historico.length - 1].presente).map(r => r.data).sort();
        const ultimoDiaPresente = diasPresente.length > 0 ? diasPresente[diasPresente.length - 1] : '---';
        const pct = totalDias > 0 ? ((totalPresencas / totalDias) * 100).toFixed(0) + '%' : '0%';

        // Adiciona os dados do aluno como uma nova linha no array
        linhas.push([
            aluno.nome,
            sala?.nome || '---',
            `${totalDias - totalPresencas}`,
            pct,
            ultimoDiaPresente
        ]);
    });

    /**
     * PROCESSAMENTO DE TEXTO:
     * Converte o array de linhas em uma string única.
     * O 'escapeCSV' garante que nomes com vírgulas não quebrem a estrutura do arquivo.
     */
    const conteudo = linhas.map(linha => linha.map(escapeCSV).join(',')).join('\r\n');
    downloadArquivo('relatorio-presenca.csv', conteudo, 'text/csv;charset=utf-8;');
}

/**
 * FUNÇÃO DE TRATAMENTO (Sanitização):
 * Envolve os valores em aspas e duplica aspas internas.
 * Isso evita que caracteres especiais corrompam o arquivo CSV.
 */
function escapeCSV(valor) {
    return `"${String(valor).replace(/"/g, '""')}"`;
}

/**
 * UTILITÁRIO DE DOWNLOAD:
 * Cria um link temporário oculto no navegador para disparar a janela de salvamento.
 * Utiliza 'Blob' para lidar com grandes volumes de dados de forma eficiente.
 */
function downloadArquivo(nome, conteudo, tipo) {
    const blob = new Blob([conteudo], { type: tipo });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nome; // Nome que aparecerá na pasta Downloads do usuário
    document.body.appendChild(link);
    link.click(); // Simula o clique do usuário
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Limpa a memória do navegador
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
