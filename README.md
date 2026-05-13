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
    inputCor.value = "#007bff"; // Reseta para a cor padrão (Azul Bootstrap)
    
    exibirAlerta("Sucesso!", `A sala "${nome}" foi criada.`);
    
    // ----- REQUISITO 7: Atualiza a interface (listas e menus suspensos) em tempo real
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

**DELETAR:**

```javascript
// ----- REQUISITO 1 e 5: Remoção Segura de Sala.
function removerSala(id) {
    const alunos = getData("alunos");
    
    const salaComAlunos = alunos.some(a => a.salaId == id);

    if (salaComAlunos) {
        // ----- REQUISITO 7: Feedback visual impeditivo
        exibirAlerta("Não é possível remover", "Remova os alunos dessa sala antes de excluí-la.");
        return; // Aborta a exclusão para evitar alunos sem sala
    }
   
    const salas = getData("salas").filter(s => s.id != id);
    setData("salas", salas);

    atualizarSelects();
    listarSalas();
    exibirAlerta("Removido", "A sala foi removida com sucesso.");
}

 // ----- REQUISITO 1 e 5: Edição de Aluno com Validação.
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

            // ----- REQUISITO 5: Validação de campo vazio na edição.
            if (!novoNome) {
                exibirAlerta("Nome inválido", "O nome da sala não pode ficar vazio.");
                return;
            }

            // ----- REQUISITO 1: Verificação de Duplicidade.
            const salaExiste = salas.find(s => s.nome.toLowerCase() === novoNome.toLowerCase() && s.id != id);
            if (salaExiste) {
                exibirAlerta("Erro de cadastro", "Já existe outra sala com esse nome.");
                return;
            }

            sala.nome = novoNome;
            sala.cor = novaCor;
            setData("salas", salas);

            // ----- REQUISITO 7: Sincronização da Interface.
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

> *Embutido nesse CRUD, foram adicionadas regras de negócio para prevenir que o sistema crie duas salas com o mesmo nome e diversos outros erros de validação.*

---

### Gestão de Alunos

* **Alunos:** CRIAR, LISTAR, DELETAR e ATUALIZAR.

**CRIAR:**
```javascript
// ----- REQUISITO 1 e 5: Gestão de Alunos e Integridade Relacional.
function cadastrarAluno() {
    const nome = document.getElementById("nomeAluno").value.trim();
    const salaId = document.getElementById("selectSala").value;

    // ----- REQUISITO 5: Validação Forte (Campo Vazio e Vínculo Obrigatório).
    if (!nome || !salaId) {
        exibirAlerta("Erro de cadastro", "Preencha o nome e selecione uma sala.");
        return; // Interrompe o processo para garantir a integridade dos dados
    }

    // Recupera a base de dados de alunos do localStorage
    const alunos = getData("alunos");

    // ----- REQUISITO 1: Evitar Duplicidade.
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
    
    // ----- REQUISITO 7: Atualiza a listagem visual imediatamente após o cadastro
    listarAlunosGeral();
    
    exibirAlerta("Sucesso!", `O aluno "${nome}" foi cadastrado.`);
}
```

**LISTAR:**
```javascript
// ----- REQUISITO 1 e 7: Listagem Organizada e Interface Dinâmica.
function listarAlunosGeral() {
    const alunos = getData("alunos");
    const salas = getData("salas");
    const lista = document.getElementById("listaAlunos");

    if (!lista) return;

    // ----- REQUISITO 7: Interface Limpa.
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
```

**DELETAR:**
```javascript
// ----- REQUISITO 1 e 5: Remoção Segura de Aluno.
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
```

**ATUALIZAR:**
```javascript
// ----- REQUISITO 1 e 5: Edição de Aluno com Validação.
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

---

### Registro de chamada
O registro de chamada é crucial para garantir o histórico e a segurança dos dados.

* **Histórico e auditoria:** Caso o professor marcasse a presença errado e precisasse mudar, o sistema não daria override no anterior. Ele salva a mudança em uma lista, guardando o horário certinho de cada clique e suas justificativas. A respeito da regra de negócio; a presença pode apenas ser marcada até o final do dia. Caso haja a necessidade de alterar algo de um dia que já passou, o sistema obriga o professor a escrever uma justificativa, senão não salva.

```javascript
// ----- REQUISITO 2 e 3: Lógica de Presença e Auditoria (Regra de Ouro).
async function marcarPresenca(alunoId, checkbox) {
    const data = document.getElementById("dataChamada").value;
    const hoje = new Date().toISOString().split('T')[0];
    let presencas = getData("presencas");

    const registro = presencas.find(p => p.alunoId == alunoId && p.data == data);
    const novoStatus = checkbox.checked;

    // ----- REQUISITO 5: Validação de Segurança.
    if (!data) {
        exibirAlerta("Erro", "Selecione a data antes de marcar a presença.");
        checkbox.checked = !novoStatus;
        return;
    }

    // ----- REQUISITO 3: Regra de Negócio de Tempo.
    if (data > hoje) {
        exibirAlerta("Data inválida", "Não é possível registrar presença para data futura.");
        checkbox.checked = !novoStatus;
        return;
    }

    // ----- REQUISITO 3: Regra de Negócio "Nível Empresa".
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

    // ----- REQUISITO 2: Estrutura de Histórico (NÃO SOBRESCREVER).
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
        carregarChamada(); // Recarrega para aplicar as cores verde/vermelho (REQ 7)
    }
}

// ----- REQUISITO 3 e 7: Captura de Justificativa Obrigatória.
function solicitarJustificativa() {
    return new Promise((resolve, reject) => {
        const modalEl = document.getElementById('modalJustificativa');
        const texto = document.getElementById('textoJustificativa');
        const confirmarButton = document.getElementById('confirmarJustificativaBtn');
        const modal = new bootstrap.Modal(modalEl);
        let respostaRegistrada = false;

        texto.value = "";
        modal.show();

        const cleanup = () => {
            modalEl.removeEventListener('hidden.bs.modal', onHidden);
            confirmarButton.removeEventListener('click', confirmar);
            texto.removeEventListener('keydown', onEnter);
        };

        const confirmar = () => {
            const valor = texto.value.trim();
            if (!valor) {
                exibirAlerta("Justificativa obrigatória", "Digite uma justificativa para a alteração.");
                return;
            }
            
            respostaRegistrada = true;
            resolve(valor);
            modal.hide();
        };

        const onHidden = () => {
            if (!respostaRegistrada) reject();
            cleanup();
        };

        // UX (Requisito 7): Atalho Enter.
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
```

---

### Relatórios Automáticos
O sistema otimiza o trabalho docente através de cálculos automatizados.

* **Para o Aluno:** Mostra a porcentagem de presença, quantas faltas ele tem e qual foi o último dia que ele apareceu na aula.

```javascript
// REQUISITO 4: Relatório Individual de Alunos.
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

        const totalPresencas = registros.filter(r => 
            r.historico[r.historico.length - 1].presente
        ).length;

        const faltas = totalDias - totalPresencas; 
        const pct = totalDias > 0 ? ((totalPresencas / totalDias) * 100).toFixed(0) : 0;

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
                <td class="text-danger"><strong>${faltas}</strong></td>
                <td>${pct}%</td>
                <td>${ultimoDiaPresente}</td>
            </tr>
        `;
    });

    gerarRelatoriosSala();
}
```

* **Para a Sala:** Calcula a média da turma toda e mostra quem são os alunos que mais frequentam (o ranking).

```javascript
// ----- REQUISITO 4: Relatório Consolidado por Sala.
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

        const media = alunosSala.length > 0 
            ? estatisticas.reduce((sum, item) => sum + item.percentual, 0) / alunosSala.length 
            : 0;

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
```

---

## Como o código foi montado
Foi requerido o uso de **Bootstrap** para um visual limpo e organizado, tanto no computador quanto no celular. Modifiquei também as cores padrões do Bootstrap para botões, além de ter sinalizado faltas e presenças com cores específicas: **Verde** para quem veio e **Vermelho** para quem faltou.

* **LocalStorage:** Garante a persistência dos dados (Requisito 6).
* **Código Limpo:** Variáveis com nomes semânticos e funções modulares.

## Extras (Diferenciais)
Adicionei a funcionalidade de **Exportar Relatórios** nos formatos **JSON** e **CSV**, permitindo que os dados sejam analisados externamente no Excel.

```javascript
// REQUISITO 4: Relatório Individual de Alunos.
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
        
        const totalPresencas = registros.filter(r => 
            r.historico[r.historico.length - 1].presente
        ).length;

        // Cálculos matemáticos conforme o REQUISITO 4
        const faltas = totalDias - totalPresencas; 
        const pct = totalDias > 0 ? ((totalPresencas / totalDias) * 100).toFixed(0) : 0;

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
                <td class="text-danger"><strong>${faltas}</strong></td>
                <td>${pct}%</td>
                <td>${ultimoDiaPresente}</td>
            </tr>
        `;
    });

    gerarRelatoriosSala();
}

// ----- REQUISITO 4: Relatório Consolidado por Sala.
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

        const media = alunosSala.length > 0 
            ? estatisticas.reduce((sum, item) => sum + item.percentual, 0) / alunosSala.length 
            : 0;

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
```

---

**Recado para o professor:** Expliquei cada parte do código nos comentários do arquivo JS, mas decidi inserir partes do meu código no readme.md também. Os comentários no arquivo JS são mais explicativos, e mostram como evitei nomes duplicados e como o histórico protege as informações da escola com maior clareza.

