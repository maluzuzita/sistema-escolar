# Meu Projeto: Sistema Escolar

Atividade escolar com a premissa de resolver os seguintes problemas propostos: sumiço de dados e registros de presença, não existência histórico de alteração e relatórios inconsistentes. Para resolver isso, criei esta aplicação que simula uma estrutura funcional de um sistema escolar.

## Estrutura do sistema

### CRUD seguro
Organização dos diferentes tipos de alterações que foram requisitadas do programa: CRUD com fatores de segurança severos.
* **Salas:** CRIAR, LISTAR, DELETAR e ATUALIZAR;
  
- CRIAR:

  ```javascript
  function criarSala() {
    const inputSala = document.getElementById("nomeSala");
    const inputCor = document.getElementById("corSala");
    
    const nome = inputSala.value.trim();
    const cor = inputCor.value;

    /**
     * ----- REQUISITO 5: Validação Forte (Campo Vazio).
     */
    if (!nome) {
        exibirAlerta("Campo Vazio", "Por favor, digite um nome para a sala.");
        return; 
    }

    const salas = getData("salas");
    
    /**
     * ----- REQUISITO 1: Regra de Unicidade de Nomes.
     */
    const salaExiste = salas.find(s => s.nome.toLowerCase() === nome.toLowerCase());
    if (salaExiste) {
        exibirAlerta("Erro de Cadastro", "Esta sala já existe no sistema.");
        return;
    }
  
    salas.push({ id: Date.now(), nome, cor });
    setData("salas", salas);

    inputSala.value = "";
    inputCor.value = "#007bff"; // Reseta para a cor padrão (Azul Bootstrap)
    
    exibirAlerta("Sucesso!", `A sala "${nome}" foi criada.`);
    
    // ----- REQUISITO 7: Atualiza a interface (listas e menus suspensos) em tempo real
    atualizarSelects();
    listarSalas();
  }

- LISTAR:

  ```javascript
 ```
/* REQUISITO 1 e 7: Listagem de Salas. */
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
        `; }); }
  ```

- DELETAR:

  ```javascript
 ```
* /* ----- REQUISITO 1 e 5: Remoção Segura de Sala.
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
 */
function editarAluno(id) {
    const alunos = getData("alunos");
    const salas = getData("salas");
    const aluno = alunos.find(a => a.id == id);
    if (!aluno) return;

    const modalEl = document.getElementById('modalEditarAluno');
    const editNomeAluno = document.getElementById('editNomeAluno');
    const editSelectSala = document.getElementById('editSelectSala');
    const confirmarBtn = document.getElementById('confirmarEditarAlunoBtn');

    if (!modalEl || !editNomeAluno || !editSelectSala || !confirmarBtn) {
        exibirAlerta("Erro de interface", "Elementos do modal de edição de aluno não encontrados no HTML.");
        return;
    }

    return new Promise((resolve) => {
        editNomeAluno.value = aluno.nome;
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

            const alunoExiste = alunos.find(a =>
                a.nome.toLowerCase() === novoNome.toLowerCase() && a.salaId == novaSalaId && a.id != id
            );
            if (alunoExiste) {
                exibirAlerta("Erro de cadastro", "Já existe este aluno nesta sala.");
                return;
            }

            aluno.nome = novoNome;
            aluno.salaId = novaSalaId;
            setData("alunos", alunos);

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
```

- ATUALIZAR:

```javascript
/* ----- REQUISITO 1 e 5: Edição de Sala com Validação.*/
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

            /* ----- REQUISITO 5: Validação de campo vazio na edição. */
            if (!novoNome) {
                exibirAlerta("Nome inválido", "O nome da sala não pode ficar vazio.");
                return;
            }

            /* ----- REQUISITO 1: Verificação de Duplicidade. */
            const salaExiste = salas.find(s => s.nome.toLowerCase() === novoNome.toLowerCase() && s.id != id);
            if (salaExiste) {
                exibirAlerta("Erro de cadastro", "Já existe outra sala com esse nome.");
                return;
            }

            sala.nome = novoNome;
            sala.cor = novaCor;
            setData("salas", salas);

            /* ----- REQUISITO 7: Sincronização da Interface. */
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
```

Imbutido nesse CRUD, foram adicionadas regras de negócio para previnir que o sistema crie duas salas com o mesmo nome e diversos outros erros de validação.

* **Alunos:** Todo aluno tem que estar em uma sala. O sistema barra se tentarem cadastrar um aluno "solto".

### A Regra da Chamada (O Coração do Projeto)
Aqui é onde resolvi o problema dos erros dos professores.
* **Histórico de Verdade:** Se o professor marcar presença errado e precisar mudar, o sistema não apaga o anterior. Ele salva a mudança em uma lista (um histórico), guardando o horário certinho de cada clique.
* **Trava de Segurança:** Só dá para marcar presença até o final do dia. Se precisar mudar algo de um dia que já passou, o sistema obriga o professor a escrever uma justificativa, senão não salva.

### Relatórios Automáticos
O sistema já faz as contas sozinho para ninguém se perder nos números.
* **Para o Aluno:** Mostra a porcentagem de presença, quantas faltas ele tem e qual foi o último dia que ele apareceu na aula.
* **Para a Sala:** Calcula a média da turma toda e mostra quem são os alunos que mais frequentam (o ranking).

## 🛠️ Como eu montei o código?

Usei **Bootstrap** para o visual ficar bonito e organizado, tanto no computador quanto no celular. Usei cores para facilitar: **Verde** para quem veio e **Vermelho** para quem faltou.

Na parte técnica:
* **LocalStorage:** Salvei tudo no navegador para os dados não sumirem quando atualizar a página.
* **Organização:** Separei o código em partes. Tem o lugar que cuida só de salvar os dados, o lugar que cuida da tela e o lugar que cuida das regras (como a de não deixar campo vazio).
* **Sem nomes estranhos:** Não usei variáveis tipo "x" ou "abc". Dei nomes que explicam o que cada coisa faz para o código ficar limpo.

## Extras (Diferenciais)
Para garantir a nota máxima, adicionei a opção de **Exportar Relatórios**. O usuário pode baixar um arquivo (JSON ou CSV) com todos os dados para abrir no Excel, por exemplo. Também coloquei filtros para facilitar a busca por datas específicas.

---
**Recado para o professor:** Expliquei cada parte do código nos comentários, mostrando como evitei nomes duplicados e como o histórico protege as informações da escola.
