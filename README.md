# Projeto: Sistema Escolar

Atividade escolar com a premissa de resolver os seguintes problemas propostos: sumiço de dados e registros de presença, não existência histórico de alteração e relatórios inconsistentes. Para resolver isso, criei esta aplicação que simula uma estrutura funcional de um sistema escolar.

---

## Estrutura do sistema

### CRUD seguro de salas e alunos
Organização dos diferentes tipos de alterações que foram requisitadas do programa: CRUD com fatores de segurança severos.

* **Salas:** CRIAR, LISTAR, DELETAR e ATUALIZAR.

**CRIAR:**

```javascript
function criarSala() {
  const inputSala = document.getElementById("nomeSala");
  const inputCor = document.getElementById("corSala");
  
  const nome = inputSala.value.trim();
  const cor = inputCor.value;

  // ----- REQUISITO 5: Validação Forte (Campo Vazio).
  if (!nome) {
      exibirAlerta("Campo Vazio", "Por favor, digite um nome para a sala.");
      return; 
  }

  const salas = getData("salas");
  
   // ----- REQUISITO 1: Regra de Unicidade de Nomes.
  const salaExiste = salas.find(s => s.nome.toLowerCase() === nome.toLowerCase());
  if (salaExiste) {
      exibirAlerta("Erro de Cadastro", "Esta sala já existe no sistema.");
      return;
  }

  salas.push({ id: Date.now(), nome, cor });
  setData("salas", salas);

  inputSala.value = "";
  inputCor.value = "#007bff"; // Reseta para a cor padrão
  
  exibirAlerta("Sucesso!", `A sala "${nome}" foi criada.`);
  
  // ----- REQUISITO 7: Atualiza a interface
  atualizarSelects();
  listarSalas();
}
```

**LISTAR:**

```javascript
// REQUISITO 1 e 7: Listagem de Salas.
function listarSalas() {
    const salas = getData("salas");
    const lista = document.getElementById("listaSalas");

    if (!lista) return;

    lista.innerHTML = "";
    salas.forEach(s => {
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
```

**DELETAR:**

```javascript
// ----- REQUISITO 1 e 5: Remoção Segura de Sala.
function removerSala(id) {
    const alunos = getData("alunos");
    
    // VALIDAÇÃO DE INTEGRIDADE:
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
```

**ATUALIZAR:**

```javascript
// ----- REQUISITO 1 e 5: Edição de Sala com Validação.
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
    });
}
```

> *Embutido nesse CRUD, foram adicionadas regras de negócio para prevenir que o sistema crie duas salas com o mesmo nome e diversos outros erros de validação.*

---

### Gestão de Alunos

* **Alunos:** CRIAR, LISTAR, DELETAR e ATUALIZAR.

**CRIAR:**
```javascript
function cadastrarAluno() {
    const nome = document.getElementById("nomeAluno").value.trim();
    const salaId = document.getElementById("selectSala").value;

    if (!nome || !salaId) {
        exibirAlerta("Erro de cadastro", "Preencha o nome e selecione uma sala.");
        return;
    }

    const alunos = getData("alunos");
    const alunoExiste = alunos.find(a => 
        a.nome.toLowerCase() === nome.toLowerCase() && a.salaId === salaId
    );
    
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
```

**LISTAR:**
```javascript
function listarAlunosGeral() {
    const alunos = getData("alunos");
    const salas = getData("max-width: 100%");
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
                    <small>
                        <span style="background-color: ${salaCor}; color: ${textColor}; padding: 2px 6px; border-radius: 4px;">
                            ${salaNome}
                        </span>
                    </small>
                </div>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editarAluno(${a.id})">Editar</button>
                    <button class="btn btn-outline-danger" onclick="removerAluno(${a.id})">Excluir</button>
                </div>
            </li>`;
    });
}
```

---

### Registro de chamada
O registro de chamada é crucial para garantir o histórico e a segurança dos dados.

* **Histórico e auditoria:** O sistema não sobrescreve registros; ele salva cada mudança em uma lista de histórico com carimbo de tempo (*timestamp*) e justificativa obrigatória para alterações em datas retroativas.

```javascript
async function marcarPresenca(alunoId, checkbox) {
    const data = document.getElementById("dataChamada").value;
    const hoje = new Date().toISOString().split('T')[0];
    let presencas = getData("presencas");

    const registro = presencas.find(p => p.alunoId == alunoId && p.data == data);
    const novoStatus = checkbox.checked;

    if (data > hoje) {
        exibirAlerta("Data inválida", "Não é possível registrar presença para data futura.");
        checkbox.checked = !novoStatus;
        return;
    }

    let justificativa = "";
    if (data < hoje) {
        try {
            justificativa = await solicitarJustificativa();
        } catch {
            checkbox.checked = !novoStatus;
            return;
        }
    }

    const log = { presente: novoStatus, timestamp: new Date().toLocaleString(), justificativa };

    if (registro) {
        registro.historico.push(log);
    } else {
        presencas.push({ alunoId, data, historico: [log] });
    }

    setData("presencas", presencas);
}
```

---

### Relatórios Automáticos
O sistema otimiza o trabalho docente através de cálculos automatizados.

* **Individual:** Porcentagem de presença, total de faltas e último dia de comparecimento.
* **Coletivo:** Média da turma e ranking de alunos mais frequentes.

```javascript
function gerarRelatorios() {
    const alunos = getData("alunos");
    const presencas = getData("presencas");
    const tbody = document.getElementById("tabelaRelatorios");

    if (!tbody) return;
    tbody.innerHTML = "";

    alunos.forEach(aluno => {
        const registros = presencas.filter(p => p.alunoId == aluno.id);
        const totalDias = registros.length;
        const totalPresencas = registros.filter(r => r.historico[r.historico.length - 1].presente).length;
        const pct = totalDias > 0 ? ((totalPresencas / totalDias) * 100).toFixed(0) : 0;

        tbody.innerHTML += `
            <tr>
                <td>${aluno.nome}</td>
                <td class="text-danger"><strong>${totalDias - totalPresencas}</strong></td>
                <td>${pct}%</td>
            </tr>`;
    });
}
```

---

## Como o código foi montado
Foi utilizado **Bootstrap** para garantir responsividade. Personalizei os componentes para sinalizar presenças em **Verde** e faltas em **Vermelho**.

* **LocalStorage:** Garante a persistência dos dados (Requisito 6).
* **Código Limpo:** Variáveis com nomes semânticos e funções modulares.

## Extras (Diferenciais)
Adicionei a funcionalidade de **Exportar Relatórios** nos formatos **JSON** e **CSV**, permitindo que os dados sejam analisados externamente no Excel.

```javascript
function exportarRelatoriosCSV() {
    const alunos = getData("alunos");
    const linhas = [['Aluno', 'Sala', 'Faltas', '% Presença']];

    alunos.forEach(aluno => {
        // Lógica de mapeamento de dados...
        linhas.push([aluno.nome, 'Sala Exemplo', '0', '100%']);
    });

    const conteudo = linhas.map(linha => linha.join(',')).join('\r\n');
    downloadArquivo('relatorio.csv', conteudo, 'text/csv;charset=utf-8;');
}
