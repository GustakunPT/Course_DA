import type { Track } from './types';

// Trilha 8: o projeto final. A etapa 1 é uma limpeza a sério, corrigida no browser, com um
// ficheiro de 20 300 viagens de bicicletas (dados/bicicletas_viagens_sujas.csv), carregado
// só nesta trilha através de ficheirosDados. Os números das verificações vêm de correr o
// gerador (src/gerar_dados.py); o ficheiro limpo de referência fica só para os testes.
// As etapas 2 a 5 são de projeto (engine 'projeto'): o aluno trabalha no computador com os
// seus dados e a app só mostra entregáveis, lista e grelha. Os links das fontes da etapa 2
// foram abertos e confirmados em 17/11/2026.

export const projetoFinalTrack: Track = {
  id: 'projeto-final',
  shortTitle: '8. Projeto final',
  fullTitle: 'Projeto final: os teus dados, a tua pergunta, o teu portefólio',
  summary: 'Primeiro limpas a sério 20 300 viagens de bicicletas partilhadas, com regras escritas e contas do que sai. Depois escolhes os teus dados e a tua pergunta, fazes a análise no teu computador e publicas o projeto no teu portefólio.',
  engineLabel: 'Projeto no teu computador',
  lessons: [
    {
      id: 'pf-01-limpeza-bicicletas',
      code: '01',
      title: 'Limpeza a sério: 20 300 viagens de bicicletas',
      lede: 'Antes de escolheres os teus dados, treinas com um ficheiro à escala real: 20 300 viagens de uma rede de bicicletas partilhadas, com datas em três formatos, estações escritas de várias maneiras, viagens repetidas e durações impossíveis.',
      analogyTitle: 'A triagem do correio antes da distribuição',
      analogyBody: 'Num centro de correio ninguém distribui as cartas sem antes as separar: tiram-se as repetidas, corrigem-se as moradas mal escritas e põem-se de lado as que não podem seguir, com um registo de quantas ficaram para trás. Limpar dados é igual: cada regra tem um motivo e cada linha retirada fica contada.',
      concepts: [
        'drop_duplicates(subset="viagem_id") olha só para o identificador e fica com a primeira ocorrência (keep="first" é o valor por omissão).',
        'Para os nomes das estações: .str.normalize("NFD").str.encode("ascii", "ignore").str.decode("ascii") tira os acentos; depois .str.lower().str.strip() e .str.replace("est. ", "estacao ", regex=False). No fim, .map(dicionario) troca a forma normalizada pelo nome oficial.',
        'Datas em vários formatos: um pd.to_datetime(..., format=..., errors="coerce") por formato. Cada um dá NaT onde o formato não encaixa, e .fillna() junta os três resultados numa só coluna.',
        'Contar o que sai: guarda len(antes) - len(depois) em cada passo, ou soma a máscara booleana (True conta 1) antes de filtrar.',
      ],
      beginnerSteps: [
        'Lê o ficheiro com pd.read_csv("dados/bicicletas_viagens_sujas.csv") e espreita-o com .head() e .value_counts().',
        'Tira os duplicados por viagem_id e conta quantas linhas saíram.',
        'Normaliza as duas colunas de estações e troca-as pelo nome oficial com o dicionário estacoes_canonicas.',
        'Converte inicio e fim com os três formatos de data e junta-os com .fillna().',
        'Arruma valor_eur (vírgula para ponto, depois float) e tipo_cliente (strip, capitalize e Desconhecido no vazio).',
        'Tira as durações impossíveis e as viagens com fim antes do início, contando cada grupo.',
        'Guarda o resultado em limpo e as contagens no dicionário removidas.',
      ],
      proPractice: 'Num relatório de limpeza diz-se sempre quantas linhas entraram, quantas saíram e porquê. Quem lê a tua análise tem de poder conferir esses números sem refazer o teu trabalho.',
      commonPitfall: 'Converter datas sem format= e deixar o pandas adivinhar: 03/04/2025 tanto pode ser 3 de abril como 4 de março. Com os formatos escritos à mão não há surpresas.',
      referenceTitle: 'Limpeza a sério em pandas',
      referenceRows: [
        { syntax: 'df.drop_duplicates(subset="viagem_id")', meaning: 'Tira as linhas com um identificador repetido e fica com a primeira', example: 'viagens.drop_duplicates(subset="viagem_id")' },
        { syntax: 's.str.normalize("NFD").str.encode("ascii", "ignore").str.decode("ascii")', meaning: 'Tira os acentos de uma coluna de texto', example: '"Estação" passa a "Estacao"' },
        { syntax: 's.map(dicionario)', meaning: 'Troca cada valor pelo do dicionário (NaN se não estiver lá)', example: 's.map(estacoes_canonicas)' },
        { syntax: 'pd.to_datetime(s, format="%d/%m/%Y %H:%M", errors="coerce")', meaning: 'Converte só o que encaixa no formato; o resto fica NaT', example: '"14/03/2025 08:05"' },
        { syntax: 'a.fillna(b)', meaning: 'Preenche os vazios de a com os valores de b na mesma linha', example: 'iso.fillna(barras).fillna(com_h)' },
        { syntax: 's.str.strip().str.capitalize()', meaning: 'Tira os espaços das pontas e deixa só a primeira letra em maiúscula', example: '" ANUAL " passa a "Anual"' },
      ],
      engine: 'python',
      ficheirosDados: ['bicicletas_viagens_sujas.csv'],
      exampleCode: `import pandas as pd

viagens = pd.read_csv("dados/bicicletas_viagens_sujas.csv")
print("Linhas:", len(viagens), "| viagem_id repetidos:", viagens["viagem_id"].duplicated().sum())
print(viagens["tipo_cliente"].value_counts(dropna=False))
print(viagens["inicio"].sample(8, random_state=1).tolist())
viagens.head(10)`,
      pythonChallenge: {
        description: 'Limpa dados/bicicletas_viagens_sujas.csv por esta ordem: 1) tira os duplicados por viagem_id (fica a primeira); 2) normaliza estacao_partida e estacao_chegada (sem acentos, minúsculas, sem espaços nas pontas e "est. " passa a "estacao ") e troca-as pelo nome oficial com o dicionário estacoes_canonicas; 3) converte inicio e fim com os três formatos ("%Y-%m-%d %H:%M", "%d/%m/%Y %H:%M" e "%d-%m-%Y %Hh%M"), cada um com errors="coerce", e junta-os; 4) em valor_eur troca a vírgula por ponto e converte para float (o vazio fica NaN); 5) em tipo_cliente faz strip() e capitalize(), e o vazio passa a "Desconhecido"; 6) tira as viagens com duracao_min <= 0 ou > 1440; 7) tira as viagens com fim < inicio. Guarda o resultado em limpo e, em removidas, um dicionário com quantas linhas saíram em cada passo: "duplicadas", "duracao_impossivel" e "fim_antes_inicio".',
        starterCode: `import pandas as pd

# Forma normalizada (sem acentos, minúsculas, "estacao ...") -> nome oficial
estacoes_canonicas = {
    "estacao central": "Estação Central",
    "estacao jardim botanico": "Estação Jardim Botânico",
    "estacao ribeira": "Estação Ribeira",
    "estacao universidade": "Estação Universidade",
    "estacao sao bento": "Estação São Bento",
    "estacao do mercado": "Estação do Mercado",
    "estacao praca nova": "Estação Praça Nova",
    "estacao farol": "Estação Farol",
    "estacao parque verde": "Estação Parque Verde",
    "estacao hospital": "Estação Hospital",
    "estacao avenida da liberdade": "Estação Avenida da Liberdade",
    "estacao cais do sodre": "Estação Cais do Sodré",
}

viagens = pd.read_csv("dados/bicicletas_viagens_sujas.csv")

# 1) duplicados por viagem_id   2) estações   3) datas   4) valor_eur
# 5) tipo_cliente   6) durações impossíveis   7) fim antes do início
limpo = None
removidas = None
print(removidas, len(limpo) if limpo is not None else None)`,
        solutionCode: `import pandas as pd

# Forma normalizada (sem acentos, minúsculas, "estacao ...") -> nome oficial
estacoes_canonicas = {
    "estacao central": "Estação Central",
    "estacao jardim botanico": "Estação Jardim Botânico",
    "estacao ribeira": "Estação Ribeira",
    "estacao universidade": "Estação Universidade",
    "estacao sao bento": "Estação São Bento",
    "estacao do mercado": "Estação do Mercado",
    "estacao praca nova": "Estação Praça Nova",
    "estacao farol": "Estação Farol",
    "estacao parque verde": "Estação Parque Verde",
    "estacao hospital": "Estação Hospital",
    "estacao avenida da liberdade": "Estação Avenida da Liberdade",
    "estacao cais do sodre": "Estação Cais do Sodré",
}

viagens = pd.read_csv("dados/bicicletas_viagens_sujas.csv")

def normalizar_estacao(serie):
    s = serie.str.normalize("NFD").str.encode("ascii", "ignore").str.decode("ascii")
    s = s.str.lower().str.strip().str.replace("est. ", "estacao ", regex=False)
    return s.map(estacoes_canonicas)

def converter_datas(serie):
    iso = pd.to_datetime(serie, format="%Y-%m-%d %H:%M", errors="coerce")
    barras = pd.to_datetime(serie, format="%d/%m/%Y %H:%M", errors="coerce")
    com_h = pd.to_datetime(serie, format="%d-%m-%Y %Hh%M", errors="coerce")
    return iso.fillna(barras).fillna(com_h)

removidas = {}

# 1) duplicados por viagem_id (fica a primeira)
df = viagens.drop_duplicates(subset="viagem_id").copy()
removidas["duplicadas"] = len(viagens) - len(df)

# 2) estações  3) datas  4) valor  5) tipo de cliente
df["estacao_partida"] = normalizar_estacao(df["estacao_partida"])
df["estacao_chegada"] = normalizar_estacao(df["estacao_chegada"])
df["inicio"] = converter_datas(df["inicio"])
df["fim"] = converter_datas(df["fim"])
df["valor_eur"] = df["valor_eur"].str.replace(",", ".").astype(float)
df["tipo_cliente"] = df["tipo_cliente"].str.strip().str.capitalize().fillna("Desconhecido")

# 6) durações impossíveis
impossivel = (df["duracao_min"] <= 0) | (df["duracao_min"] > 1440)
removidas["duracao_impossivel"] = int(impossivel.sum())
df = df[~impossivel]

# 7) fim antes do início
ao_contrario = df["fim"] < df["inicio"]
removidas["fim_antes_inicio"] = int(ao_contrario.sum())
limpo = df[~ao_contrario]

print(removidas, len(limpo))
limpo.head()`,
        checks: [
          { label: 'removidas: 300 duplicadas, 200 durações impossíveis e 150 fins antes do início', expr: 'isinstance(removidas, dict) and {k: int(v) for k, v in removidas.items()} == {"duplicadas": 300, "duracao_impossivel": 200, "fim_antes_inicio": 150}', actualExpr: 'removidas', hint: 'Em cada passo conta as linhas que saem: len(antes) - len(depois), ou a soma da máscara antes de filtrar. As chaves são "duplicadas", "duracao_impossivel" e "fim_antes_inicio".' },
          { label: 'limpo tem 19 650 viagens, sem viagem_id repetido', expr: 'len(limpo) == 19650 and limpo["viagem_id"].is_unique', actualExpr: 'len(limpo) if limpo is not None else None', hint: '20 300 linhas menos 300 duplicadas, 200 durações impossíveis e 150 fins antes do início.' },
          { label: 'Só ficam os 12 nomes oficiais das estações', expr: 'limpo["estacao_partida"].notna().all() and limpo["estacao_chegada"].notna().all() and len(set(limpo["estacao_partida"]) | set(limpo["estacao_chegada"])) == 12 and all(str(e).startswith("Estação ") for e in set(limpo["estacao_partida"]) | set(limpo["estacao_chegada"]))', actualExpr: 'sorted(set(limpo["estacao_partida"].astype(str)) | set(limpo["estacao_chegada"].astype(str)))', hint: 'Normaliza (sem acentos, minúsculas, strip e "est. " para "estacao ") e só depois faz .map(estacoes_canonicas). Um NaN quer dizer que a forma normalizada não está no dicionário.' },
          { label: 'inicio e fim são datas, sem falhas, e nenhum fim vem antes do início', expr: 'pd.api.types.is_datetime64_any_dtype(limpo["inicio"]) and pd.api.types.is_datetime64_any_dtype(limpo["fim"]) and limpo["inicio"].notna().all() and limpo["fim"].notna().all() and bool((limpo["fim"] >= limpo["inicio"]).all())', actualExpr: '(str(limpo["inicio"].dtype), int(limpo["inicio"].isna().sum()), int(limpo["fim"].isna().sum()))', hint: 'Um pd.to_datetime(..., format=..., errors="coerce") por formato e depois iso.fillna(barras).fillna(com_h). O terceiro formato é "%d-%m-%Y %Hh%M".' },
          { label: 'valor_eur é número: 500 vazios e soma de 23 704.00 €', expr: 'pd.api.types.is_float_dtype(limpo["valor_eur"]) and int(limpo["valor_eur"].isna().sum()) == 500 and math.isclose(float(limpo["valor_eur"].sum()), 23704.0, abs_tol=0.01)', actualExpr: '(str(limpo["valor_eur"].dtype), int(limpo["valor_eur"].isna().sum()))', hint: 'df["valor_eur"].str.replace(",", ".").astype(float). Os vazios ficam NaN: não os troques por 0.' },
          { label: 'tipo_cliente: Anual (11 507), Ocasional (7 543) e Desconhecido (600)', expr: 'limpo["tipo_cliente"].value_counts().to_dict() == {"Anual": 11507, "Ocasional": 7543, "Desconhecido": 600}', actualExpr: 'limpo["tipo_cliente"].value_counts(dropna=False).to_dict()', hint: '.str.strip().str.capitalize() e depois .fillna("Desconhecido").' },
          { label: 'A limpeza funciona com outro lote de viagens', expr: '(lambda r: {k: int(v) for k, v in r["removidas"].items()} == {"duplicadas": 1, "duracao_impossivel": 1, "fim_antes_inicio": 1} and list(r["limpo"]["viagem_id"]) == ["V1", "V2"] and list(r["limpo"]["estacao_partida"]) == ["Estação Central", "Estação Ribeira"] and list(r["limpo"]["estacao_chegada"]) == ["Estação Farol", "Estação São Bento"] and list(r["limpo"]["tipo_cliente"]) == ["Anual", "Desconhecido"] and abs(float(r["limpo"]["valor_eur"].iloc[1]) - 1.5) < 0.001 and str(r["limpo"]["inicio"].iloc[1]) == "2025-03-14 09:00:00")(correr_com(viagens=pd.DataFrame({"viagem_id": ["V1", "V1", "V2", "V3", "V4"], "inicio": ["2025-03-14 08:05", "2025-03-14 08:05", "14/03/2025 09:00", "14-03-2025 9h05", "2025-03-15 10:00"], "fim": ["2025-03-14 08:20", "2025-03-14 08:20", "14/03/2025 09:30", "14-03-2025 8h55", "2025-03-15 10:00"], "estacao_partida": [" estacao central ", " estacao central ", "EST. RIBEIRA", "Estacao Hospital", "Estação Central"], "estacao_chegada": ["Estação Farol", "Estação Farol", "ESTAÇÃO SÃO BENTO", "Estação Central", "Estação Central"], "duracao_min": [15, 15, 30, 10, 0], "tipo_cliente": ["anual", "anual", None, "Ocasional", "Ocasional"], "valor_eur": ["0.00", "0.00", "1,50", "2.00", "1.00"]})))', actualExpr: 'correr_com(viagens=pd.DataFrame({"viagem_id": ["V1", "V1", "V2", "V3", "V4"], "inicio": ["2025-03-14 08:05", "2025-03-14 08:05", "14/03/2025 09:00", "14-03-2025 9h05", "2025-03-15 10:00"], "fim": ["2025-03-14 08:20", "2025-03-14 08:20", "14/03/2025 09:30", "14-03-2025 8h55", "2025-03-15 10:00"], "estacao_partida": [" estacao central ", " estacao central ", "EST. RIBEIRA", "Estacao Hospital", "Estação Central"], "estacao_chegada": ["Estação Farol", "Estação Farol", "ESTAÇÃO SÃO BENTO", "Estação Central", "Estação Central"], "duracao_min": [15, 15, 30, 10, 0], "tipo_cliente": ["anual", "anual", None, "Ocasional", "Ocasional"], "valor_eur": ["0.00", "0.00", "1,50", "2.00", "1.00"]})).get("removidas")', hint: 'Calcula tudo a partir de viagens, sem escrever os números à mão: num lote de 5 linhas sai 1 duplicada, 1 duração impossível e 1 fim antes do início.' },
        ],
      },
      quiz: {
        question: 'Porque é que guardas quantas linhas saíram por cada motivo, em vez de mostrares só o total final?',
        options: [
          'Porque o pandas só deixa filtrar se guardares a contagem',
          'Para quem lê poder conferir a limpeza e o que se perdeu',
          'Porque assim a limpeza corre mais depressa no browser',
          'Para poderes repor mais tarde as linhas que apagaste do ficheiro',
        ],
        correctIndex: 1,
        explanation: 'As contagens por motivo são o recibo da limpeza: mostram que 650 das 20 300 linhas saíram e porquê. Sem elas, ninguém consegue conferir se a limpeza foi razoável ou se apagou dados a mais.',
      },
    },
    {
      id: 'pf-00-preparar-computador',
      code: '02',
      title: 'Preparar o computador: Python, VS Code, Jupyter e Git',
      lede: 'Até aqui corriste tudo no browser. Antes de começares o teu projeto próprio, instalas Python, VS Code (com Jupyter) e Git no teu computador, crias conta no GitHub e aprendes a resolver os 4 erros mais comuns no Windows.',
      analogyTitle: 'Montar a bancada antes de cozinhar',
      analogyBody: 'Não precisas de uma cozinha profissional, mas precisas de faca afiada, tábua e fogão a funcionar antes de ligar o lume. Instalar o Python com PATH, criar uma pasta .venv e ligar o Git ao GitHub leva 20 minutos e evita que bloqueies a meio do projeto.',
      concepts: [
        'Python 3 no Windows: descarrega de python.org (ou winget install Python.Python.3.12) e marca obrigatoriamente "Add Python to PATH" no primeiro ecrã do instalador. Confirma com python --version (ou py --version no Windows).',
        'Ambiente virtual (.venv) por projeto: evita conflitos entre bibliotecas. No terminal, cria com python -m venv .venv, ativa (.venv\\Scripts\\Activate.ps1 no PowerShell ou source .venv/bin/activate no Git Bash/macOS) e instala pandas, matplotlib e jupyter.',
        'VS Code + extensões Python e Jupyter: abre a pasta do projeto no VS Code, cria um ficheiro .ipynb e escolhe o kernel .venv no canto superior direito.',
        'Git e conta no GitHub: instala o Git (git-scm.com; no Windows traz o Git Bash e o Git Credential Manager), configura user.name e user.email e cria uma conta gratuita em github.com.',
        'Erros comuns no Windows: 1) "\'python\' is not recognized" -> faltou Add Python to PATH; 2) "PSSecurityException / running scripts is disabled" no PowerShell -> corre Set-ExecutionPolicy -Scope CurrentUser RemoteSigned (ou usa Git Bash); 3) ModuleNotFoundError no caderno -> escolheste o Python global em vez do kernel .venv.',
      ],
      beginnerSteps: [
        'Instala o Python 3 (marcando "Add Python to PATH" no Windows) e confirma no terminal com python --version.',
        'Instala o Git (git-scm.com), o VS Code e cria a tua conta gratuita no GitHub.',
        'No VS Code, instala as extensões oficiais "Python" e "Jupyter" da Microsoft.',
        'Cria uma pasta de teste, faz python -m venv .venv, ativa o ambiente e corre pip install pandas matplotlib jupyter.',
        'Abre um ficheiro teste.ipynb no VS Code, escolhe o kernel .venv e corre import pandas as pd; print(pd.__version__).',
      ],
      proPractice: 'Usa sempre um .venv por projeto e nunca instales pacotes no Python global do sistema: quando partilhas o código, pip freeze ou requirements.txt garante que outra pessoa corre exatamente as mesmas bibliotecas.',
      commonPitfall: 'Instalar Python no Windows sem marcar "Add Python to PATH", ou instalar pandas no terminal global e depois no VS Code usar outro Python no notebook (dando ModuleNotFoundError).',
      referenceTitle: 'Comandos de arranque e erros típicos no Windows',
      referenceRows: [
        { syntax: 'python --version  (ou py --version)', meaning: 'Confirma que o Python está instalado e no PATH', example: 'Python 3.12.x' },
        { syntax: 'python -m venv .venv', meaning: 'Cria o ambiente virtual isolado na pasta do projeto', example: 'Pasta .venv/' },
        { syntax: '.venv\\Scripts\\Activate.ps1  (ou source .venv/Scripts/activate no Git Bash)', meaning: 'Ativa o ambiente virtual no Windows antes de instalar pacotes', example: 'Aparece (.venv) no início da linha' },
        { syntax: 'Set-ExecutionPolicy -Scope CurrentUser RemoteSigned', meaning: 'Resolve o erro PSSecurityException ao ativar .venv no PowerShell do Windows', example: 'Corre uma única vez' },
        { syntax: 'pip install pandas matplotlib jupyter', meaning: 'Instala as 3 bibliotecas base do projeto final dentro do .venv', example: 'Com (.venv) ativo' },
        { syntax: 'git config --global user.name "O Teu Nome" && git config --global user.email "teu@email.pt"', meaning: 'Identifica os teus commits antes de fazeres o primeiro git commit', example: 'Igual ao email do GitHub' },
      ],
      engine: 'projeto',
      exampleCode: `# --- 1. Verificar Python e Git (PowerShell ou Git Bash) ---
python --version
git --version

# --- 2. Configurar Git (só na primeira vez neste computador) ---
git config --global user.name "Ana Silva"
git config --global user.email "ana.silva@exemplo.pt"

# --- 3. Se o PowerShell bloquear Activate.ps1 (Windows): ---
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

# --- 4. Criar e ativar .venv numa pasta de teste ---
mkdir teste-ambiente
cd teste-ambiente
python -m venv .venv
# PowerShell: .venv\\Scripts\\Activate.ps1
# Git Bash:   source .venv/Scripts/activate
# macOS/Linux: source .venv/bin/activate
pip install pandas matplotlib jupyter

# --- 5. Confirmar que o pandas funciona ---
python -c "import pandas as pd, matplotlib; print('Pronto:', pd.__version__)"`,
      projectSpec: {
        entregaveis: [
          'Python 3, VS Code (com extensões Python + Jupyter) e Git instalados e a responder no terminal.',
          'Conta criada no GitHub e git config configurado com nome e email.',
          'Um ambiente .venv de teste onde import pandas e matplotlib correm sem erros num notebook .ipynb.',
        ],
        lista: [
          'python --version (ou py --version) e git --version funcionam no terminal sem erros.',
          'Configurei git config --global user.name e user.email com o mesmo email da minha conta GitHub.',
          'Consegui criar e ativar um ambiente virtual .venv (e resolvi o ExecutionPolicy no Windows, se apareceu).',
          'Instalei pandas, matplotlib e jupyter dentro do .venv e escolhi esse kernel no VS Code.',
          'Corri import pandas as pd numa célula de um ficheiro .ipynb sem ModuleNotFoundError.',
        ],
        grelha: [
          { criterio: 'Python no PATH', bom: 'python --version e pip funcionam diretamente no terminal.', aMelhorar: 'Só abre pela Microsoft Store ou dá "\'python\' is not recognized".' },
          { criterio: 'Ambiente isolado (.venv)', bom: 'Pacotes instalados dentro de .venv, e o VS Code usa o kernel .venv no .ipynb.', aMelhorar: 'Instala pacotes globalmente ou o caderno usa outro Python e falha ao importar pandas.' },
          { criterio: 'Git e GitHub prontos', bom: 'git --version funciona, user.name/email configurados e conta no GitHub criada.', aMelhorar: 'Deixa para configurar o Git na véspera de publicar e bloqueia no primeiro commit.' },
          { criterio: 'Autonomia no Windows', bom: 'Sabe resolver PSSecurityException ou usar Git Bash em alternativa ao PowerShell.', aMelhorar: 'Bloqueia no primeiro erro de permissão de scripts sem saber o comando.' },
        ],
      },
      quiz: {
        question: 'Instalaste o pandas no terminal dentro do .venv, mas quando corres import pandas as pd num caderno .ipynb no VS Code aparece ModuleNotFoundError. Qual é a causa mais provável?',
        options: [
          'O pandas não funciona em ficheiros .ipynb, só em .py.',
          'O notebook no VS Code está a usar o kernel do Python global em vez do kernel do .venv.',
          'Faltou reiniciar o computador depois do pip install.',
          'Tens de instalar o pandas com sudo ou como Administrador.',
        ],
        correctIndex: 1,
        explanation: 'No VS Code, cada caderno .ipynb escolhe o seu kernel no canto superior direito. Se ficar o Python global em vez de .venv, o caderno não vê as bibliotecas instaladas dentro do .venv.',
      },
    },
    {
      id: 'pf-02-pergunta-dados',
      code: '02',
      title: 'O teu projeto: escolher a pergunta e os dados',
      lede: 'Agora és tu que decides. Passas de um tema que te interessa a uma pergunta com uma decisão, encontras dados públicos que a respondem, confirmas a licença e crias o repositório onde o projeto vai viver.',
      analogyTitle: 'A planta antes da obra',
      analogyBody: 'Ninguém começa uma casa a comprar tijolos. Primeiro decide-se para quem é, quantos quartos tem e quanto custa; só depois se escolhe o terreno. Na análise de dados, a pergunta é a planta e os dados são o terreno: se o terreno não serve, muda-se de terreno ou ajusta-se a planta antes de começar a cavar.',
      concepts: [
        'Antes de começares, espreita o projeto de exemplo completo e publicado do curso (Turismo no Algarve) em github.com/GustakunPT/Course_DA/tree/main/exemplo-projeto-turismo-algarve: vês logo o README, os dois cadernos e o gráfico final.',
        'Um tema não é uma pergunta. "Turismo no Algarve" é um tema; "Em que meses deve um alojamento do Algarve reforçar o pessoal?" é uma pergunta com decisão. Começa por "onde", "quando", "quanto" ou "qual" e diz quem decide.',
        'Ideias de perguntas por tema para te inspirares: Turismo (quando reforçar equipa), Mobilidade (em que horas há mais falhas ou procura de transportes), Saúde (que especialidades ou unidades têm maior tempo de espera) e Energia (que distritos ou meses têm maior consumo ou produção renovável).',
        'Antes de te comprometeres, abre o ficheiro e confirma que os dados respondem: têm as colunas de que precisas (o quê, onde, quando), o período certo e linhas suficientes para comparar? Se não, ajusta a pergunta agora, não na véspera de publicar.',
        'Dados abertos não são todos iguais: cada conjunto tem a sua licença (ex.: CC BY 4.0 no INE / dados.gov.pt, CC0 na CM Porto). Lê-a na página do conjunto e escreve o nome exato da licença no README.',
        'A estrutura do repositório é a do curso: dados/ (os ficheiros originais, nunca editados à mão), cadernos/ (a análise em Jupyter), README.md (pergunta, dados, conclusões) e .gitignore (o que não vai para o GitHub).',
      ],
      beginnerSteps: [
        'Abre o projeto de exemplo em github.com/GustakunPT/Course_DA/tree/main/exemplo-projeto-turismo-algarve para veres como fica o resultado final.',
        'Escolhe um tema (turismo, mobilidade, saúde, energia ou outro que conheças) e escreve uma pergunta com decisão e quem decide.',
        'Procura dados para a tua pergunta nas fontes da tabela de referência e abre o ficheiro antes de escolher.',
        'Confirma que o ficheiro tem as colunas, o período e linhas suficientes, e anota a fonte, o link, a data e a licença exata.',
        'Cria a pasta do projeto com dados/, cadernos/, README.md e .gitignore, corre git init -b main e faz o primeiro commit.',
        'Escreve no README a pergunta, quem decide e de onde vêm os dados com a licença concreta.',
      ],
      proPractice: 'Numa entrevista perguntam quase sempre "porque escolheste este projeto?". A melhor resposta é a pergunta e quem a usaria: "Queria saber em que meses um alojamento do Algarve precisa de mais pessoal, e os dados de dormidas por mês respondem a isso."',
      commonPitfall: 'Escolher primeiro os dados "porque são interessantes" e procurar depois uma pergunta: acabas com um projeto que descreve colunas e não ajuda ninguém a decidir. Outro erro comum é escolher um conjunto com 30 linhas, onde nenhuma conclusão se aguenta.',
      referenceTitle: 'Fontes abertas e ideias de perguntas por tema',
      referenceRows: [
        { syntax: 'Exemplo completo publicado no GitHub', meaning: 'Repositório de referência do curso (dados, 2 cadernos, gráfico e README)', example: 'https://github.com/GustakunPT/Course_DA/tree/main/exemplo-projeto-turismo-algarve' },
        { syntax: 'Turismo — INE / dados.gov.pt (CC BY 4.0)', meaning: 'Dormidas em alojamento turístico por município e mês', example: '"Em que meses deve um alojamento do Algarve reforçar o pessoal?"' },
        { syntax: 'Mobilidade — dadosabertos.cm-porto.pt (CC0) / dados.gov.pt', meaning: 'Viagens, validações ou condicionamentos de trânsito por zona e hora', example: '"Em que troços e horas concentrar manutenção sem travar a hora de ponta?"' },
        { syntax: 'Saúde — dados.gov.pt / Transparência SNS (CC BY 4.0)', meaning: 'Tempos médios de espera ou atendimentos por hospital e especialidade', example: '"Que hospitais têm maior diferença face à meta de espera em cirurgia?"' },
        { syntax: 'Energia — dados.gov.pt / DGEG (CC BY 4.0)', meaning: 'Consumo elétrico ou produção renovável por distrito e mês', example: '"Em que meses o peso solar reduz mais a dependência de outras fontes?"' },
        { syntax: 'https://www.pordata.pt/ e https://www.ine.pt/', meaning: 'Usa a PORDATA para descobrir indicadores, mas descarrega da fonte original (INE / dados.gov.pt) para teres licença aberta clara', example: 'Confirma sempre a licença na página do conjunto' },
      ],
      engine: 'projeto',
      exampleCode: `# --- No terminal (Git Bash no Windows, Terminal no macOS ou Linux) ---
mkdir turismo-algarve
cd turismo-algarve
mkdir dados cadernos
git init -b main

# --- Ficheiro .gitignore (cria-o no VS Code, na raiz do projeto) ---
.ipynb_checkpoints/
__pycache__/
.venv/
.DS_Store

# --- Ficheiro README.md, para já só com isto ---
## Pergunta
Em que meses deve um alojamento do Algarve reforçar o pessoal?
Quem decide: o gestor de um alojamento local.

## Dados
dados/dormidas_algarve_bruto.csv, descarregado do INE (via dados.gov.pt) a 17/11/2026.
Licença: CC BY 4.0.

# --- Põe o CSV em dados/ e volta ao terminal ---
git add .
git commit -m "Pergunta, estrutura do projeto e dados originais do INE"`,
      projectSpec: {
        entregaveis: [
          'Um repositório Git com dados/, cadernos/, README.md e .gitignore, com pelo menos um commit.',
          'O ficheiro de dados original em dados/ (ou, se a licença ou o tamanho não deixarem, o link e as instruções para o descarregar).',
          'A pergunta escrita no README, com quem decide, e a fonte dos dados com o link, a data de descarga e a licença.',
        ],
        lista: [
          'Escrevi a pergunta no README com uma decisão ("onde", "quando", "quanto" ou "qual") e quem a toma.',
          'Abri o ficheiro de dados e confirmei que tem as colunas, o período e as linhas de que a pergunta precisa.',
          'Li a licença do conjunto na página da fonte e escrevi-a no README, com o link e a data em que descarreguei.',
          'Os meus dados vêm de uma fonte pública que posso citar e não têm dados pessoais.',
          'Criei o repositório com dados/, cadernos/, README.md e .gitignore e fiz o primeiro commit.',
          'Não editei o ficheiro original à mão: as mudanças vão ser feitas no caderno.',
        ],
        grelha: [
          { criterio: 'Pergunta', bom: 'Uma frase com uma decisão e quem a toma: "Em que meses deve um alojamento do Algarve reforçar o pessoal?"', aMelhorar: 'Um tema ("turismo") ou uma pergunta que só descreve ("como evoluíram as dormidas?").' },
          { criterio: 'Os dados respondem', bom: 'Têm as colunas (o quê, onde, quando), o período e linhas suficientes para comparar.', aMelhorar: 'Falta a coluna principal, o período é curto ou há tão poucas linhas que qualquer diferença pode ser acaso.' },
          { criterio: 'Fonte e licença', bom: 'README com a fonte, o link, a data de descarga e a licença confirmada na página do conjunto.', aMelhorar: '"Dados da internet", sem link nem licença.' },
          { criterio: 'Estrutura', bom: 'dados/, cadernos/, README.md e .gitignore desde o primeiro commit, com o ficheiro original intacto.', aMelhorar: 'Tudo na mesma pasta, o original editado no Excel e nenhum .gitignore.' },
          { criterio: 'Tamanho do projeto', bom: 'Cabe em uma ou duas semanas: um conjunto de dados principal e uma pergunta.', aMelhorar: 'Cinco perguntas e quatro fontes que nunca chegam a ser cruzadas.' },
        ],
      },
      quiz: {
        question: 'Qual destas é uma boa pergunta para o teu projeto de portefólio?',
        options: [
          '"Vou analisar os dados do turismo em Portugal."',
          '"Em que meses deve um alojamento do Algarve reforçar o pessoal?"',
          '"Quais são as colunas do ficheiro de dormidas do INE?"',
          '"Como é que o turismo mudou ao longo dos últimos vinte anos em todo o país?"',
        ],
        correctIndex: 1,
        explanation: 'Uma boa pergunta tem uma decisão e alguém que a toma: diz que número procurar e o que fazer com ele. As outras são um tema, uma descrição do ficheiro ou uma pergunta tão larga que não leva a nenhuma decisão.',
      },
    },
    {
      id: 'pf-03-explorar-limpar',
      code: '03',
      title: 'Explorar e limpar os teus dados',
      lede: 'Repetes o método da limpeza das bicicletas, agora nos teus dados e sem enunciado: olhas para a forma, os tipos, os vazios e os duplicados, e escreves cada regra de limpeza com o motivo e as linhas que tirou.',
      analogyTitle: 'A inspeção antes de comprar um carro usado',
      analogyBody: 'Ninguém compra um carro usado só pela fotografia: abre-se o capô, confirmam-se os quilómetros, procura-se ferrugem e anota-se o que é preciso arranjar. O primeiro caderno é essa inspeção: antes de qualquer conclusão, sabes o que os dados têm, o que lhes falta e o que vais corrigir, e fica tudo escrito para quem vier a seguir.',
      concepts: [
        'Primeiro olhar: df.shape (linhas e colunas), df.dtypes (tipos), df.head() e df.sample(10). Uma coluna de números lida como object quase sempre esconde vírgulas, espaços ou texto como "n.d.".',
        'Ficheiros portugueses: muitos usam ponto e vírgula e vírgula decimal, por isso lês com pd.read_csv(..., sep=";", decimal=","). Se os acentos aparecerem estragados, experimenta encoding="latin-1"; se houver linhas de título antes da tabela, usa skiprows=.',
        'Valores em falta: df.isna().sum() por coluna. Decides caso a caso (tirar a linha, deixar vazio ou preencher) e escreves porquê. Trocar vazios por 0 muda as médias.',
        'Duplicados: df.duplicated().sum() para linhas inteiras e df.duplicated(subset=[...]).sum() para a chave que devia ser única. Escolhe-a com cuidado: com vários anos de dados, a chave é município, ano e mês; só com município e mês apagavas todos os anos menos o primeiro.',
        'Ponto de verificação a meio (5 sinais de que os dados estão prontos): 1) chave única sem duplicados; 2) números e datas com o tipo certo (não object); 3) categorias sem grafias repetidas; 4) vazios/impossíveis contados e documentados; 5) ficheiro limpo gravado à parte e caderno corre do início ao fim após reiniciar o kernel.',
      ],
      beginnerSteps: [
        'Abre o Jupyter (ou o VS Code) na pasta do projeto e cria cadernos/01_explorar_limpar.ipynb.',
        'Na primeira célula, lê o ficheiro e mostra shape, dtypes, head() e isna().sum().',
        'Escreve numa célula de texto o que encontraste: tipos errados, vazios, duplicados, categorias escritas de várias maneiras, valores impossíveis.',
        'Para cada problema, escreve a regra e o motivo e aplica-a numa célula que conta as linhas que saem.',
        'Junta as contagens num pequeno relatório de limpeza: quantas linhas entraram, quantas saíram por cada motivo e quantas ficaram.',
        'Guarda o resultado em dados/ com outro nome, reinicia o kernel, corre o caderno do início ao fim e faz commit.',
      ],
      proPractice: 'No trabalho, a primeira pergunta sobre qualquer número é "de onde vem e o que tiraste?". Um relatório de limpeza com contagens por motivo responde a isso em 10 segundos e mostra a um recrutador que não escondes o que deitaste fora.',
      commonPitfall: 'Limpar "até parecer bem" sem escrever as regras: duas semanas depois já não sabes porque saíram 400 linhas, e quem lê o caderno também não. O outro erro clássico é abrir e gravar o CSV original no Excel, que pode mudar datas e números sem avisar.',
      referenceTitle: 'Primeiro caderno: explorar e limpar',
      referenceRows: [
        { syntax: 'pd.read_csv(f, sep=";", decimal=",")', meaning: 'Lê um CSV no formato português (ponto e vírgula e vírgula decimal)', example: 'pd.read_csv("../dados/dormidas.csv", sep=";", decimal=",")' },
        { syntax: 'df.shape, df.dtypes, df.sample(10)', meaning: 'Tamanho, tipos e uma amostra ao acaso', example: '(1200, 5)' },
        { syntax: 'df.isna().sum()', meaning: 'Vazios por coluna', example: 'dormidas    37' },
        { syntax: 'df.duplicated(subset=["municipio", "ano", "mes"]).sum()', meaning: 'Repetidos na chave que devia ser única (com vários anos, o ano faz parte da chave)', example: '12' },
        { syntax: 'pd.to_numeric(s, errors="coerce")', meaning: 'Converte para número; o que não for número fica NaN (conta-os antes e depois)', example: '"n.d." passa a NaN' },
        { syntax: 'df.to_csv("../dados/limpo.csv", index=False)', meaning: 'Guarda o resultado sem tocar no original', example: 'dados/limpo.csv' },
      ],
      engine: 'projeto',
      exampleCode: `# cadernos/01_explorar_limpar.ipynb, primeira célula
import pandas as pd

# O caderno está em cadernos/, por isso os dados estão em ../dados/
df = pd.read_csv("../dados/dormidas_algarve.csv", sep=";", decimal=",", encoding="utf-8")

print("Linhas e colunas:", df.shape)
print(df.dtypes)
print("Vazios por coluna:")
print(df.isna().sum())
print("Linhas repetidas:", df.duplicated().sum())
df.sample(10, random_state=1)

# Segunda célula: uma regra, com o motivo e a contagem
# Regra 1: cada município aparece uma vez por ano e mês (fica a primeira ocorrência).
# O ano entra na chave: só com município e mês apagavas todos os anos menos o primeiro.
antes = len(df)
df = df.drop_duplicates(subset=["municipio", "ano", "mes"])
print("Saíram", antes - len(df), "linhas repetidas")`,
      projectSpec: {
        entregaveis: [
          'Um caderno cadernos/01_explorar_limpar.ipynb que corre do início ao fim sem erros.',
          'Um relatório de limpeza no caderno: linhas que entraram, que saíram por cada motivo e que ficaram.',
          'O ficheiro limpo guardado em dados/ com outro nome, com o original intacto.',
        ],
        lista: [
          'Sinal 1 (Forma e chave): mostrei shape/head, eliminei duplicados e confirmei df.duplicated(subset=[...]).sum() == 0.',
          'Sinal 2 (Tipos): todas as colunas numéricas e de datas têm tipo numérico ou datetime (sem vírgulas em texto).',
          'Sinal 3 (Categorias): conferi value_counts() para garantir que não há espaços ou maiúsculas/minúsculas duplicadas.',
          'Sinal 4 (Vazios e regras): cada remoção ou preenchimento tem o motivo escrito e o total de linhas antes/depois batido.',
          'Sinal 5 (Reprodutível): o original está intacto, o limpo está noutro ficheiro em dados/ e o caderno corre do zero após reiniciar o kernel.',
        ],
        grelha: [
          { criterio: 'Exploração', bom: 'Forma, tipos, vazios e duplicados à vista, com uma frase sobre o que cada um quer dizer.', aMelhorar: 'Só um df.head(), sem olhar para os tipos nem para os vazios.' },
          { criterio: 'Regras escritas', bom: 'Cada regra tem um motivo: "Tiro as linhas sem município porque não as consigo comparar com as outras."', aMelhorar: 'Código de limpeza sem explicação, ou regras que mudaram a meio sem nota.' },
          { criterio: 'Contagens', bom: 'Entraram 1 200 linhas, saíram 37 sem valor e 12 repetidas, ficaram 1 151: as contas batem certo.', aMelhorar: 'Não se sabe quantas linhas saíram nem porquê.' },
          { criterio: 'Tipos', bom: 'Números como int ou float, datas como datetime e categorias uniformizadas.', aMelhorar: 'Valores em texto com vírgula, datas em texto, "Lisboa" e "lisboa" como categorias diferentes.' },
          { criterio: 'Reprodutível', bom: 'Corre do início ao fim depois de reiniciar o kernel, e o original fica intacto.', aMelhorar: 'Só funciona se as células correrem por uma ordem que só tu sabes.' },
        ],
      },
      quiz: {
        question: 'No teu caderno, 37 linhas não têm valor na coluna principal. O que fazes?',
        options: [
          'Troco os vazios por 0 para não perder linhas',
          'Decido a regra, escrevo o motivo e conto as linhas afetadas',
          'Apago essas linhas no Excel antes de abrir o caderno',
          'Ignoro-os, porque o pandas já os deixa de fora nas médias e nas somas',
        ],
        correctIndex: 1,
        explanation: 'Não há uma resposta única para os vazios: depende do motivo. O que não pode faltar é a regra escrita e a contagem, para quem lê saber o que mudou. Trocar por 0 baixa as médias, editar no Excel não deixa rasto e ignorá-los esconde quantos casos tens de facto.',
      },
    },
    {
      id: 'pf-04-analisar-recomendar',
      code: '04',
      title: 'Analisar e recomendar: um número, um gráfico, uma frase',
      lede: 'Respondes à tua pergunta como no projeto final guiado do Nível Profissional, agora sem guia: um número que responde, um gráfico honesto com a conclusão no título e uma recomendação numa frase que alguém pode usar. E dizes com clareza o que os teus dados não permitem concluir.',
      analogyTitle: 'O médico que explica as análises',
      analogyBody: 'Um bom médico não te entrega a folha das análises e vai embora: diz o que tens, aponta o valor que o mostra e diz o que fazer. E diz também o que as análises não mostram ("para isso precisamos de outro exame"). A tua análise é igual: um número, uma imagem que o mostra, uma recomendação e os limites.',
      concepts: [
        'Um número que responde à pergunta, com a comparação que lhe dá sentido: "o mês de pico tem 2,3 vezes as dormidas de um mês médio" diz mais do que o total desse mês sozinho.',
        'Gráfico honesto: nas quantidades (barras) o eixo começa no zero; um gráfico por mensagem; o título diz a conclusão ("Agosto vale mais do dobro de um mês médio") e não a descrição ("Dormidas por mês"); os eixos têm unidades.',
        'Recomendação numa frase com decisão: o quê, quando ou onde, e o número que a sustenta. "Reforçar o pessoal de junho a setembro: são os meses acima da média, com o pico em agosto."',
        'Correlação não é causa: se dois números sobem juntos, pode haver uma terceira coisa por trás (a época do ano, o tamanho do município). Escreve "estão associados", não "provoca".',
        'Amostras pequenas e valores extremos enganam: com poucas linhas, uma diferença pode ser acaso, e com valores muito desiguais a mediana descreve melhor o caso típico. Diz sempre quantos casos estão por trás de cada número.',
        'Grupos de tamanhos diferentes comparam-se com taxas (por 1 000 habitantes, em %), não com totais: um município grande tem mais de tudo.',
      ],
      beginnerSteps: [
        'Cria cadernos/02_analise.ipynb e lê o ficheiro limpo da etapa anterior.',
        'Calcula o número que responde à pergunta e a comparação que lhe dá sentido (a média, outro período ou outra região).',
        'Desenha um gráfico: barras com o eixo no zero, título com a conclusão e eixos com unidades. Guarda-o em PNG, numa pasta figuras/.',
        'Escreve a recomendação numa frase com a decisão e o número.',
        'Escreve uma célula "Limites" com o que os dados não permitem concluir.',
        'Mostra só o título do gráfico e a frase a alguém que não conhece os dados: se não percebe o que fazer, reescreve.',
      ],
      proPractice: 'Em entrevistas de DA é frequente receberes um ficheiro e meia hora para dizer o que farias. Quem responde com um número, um gráfico e uma frase com decisão, e diz logo o limite da análise, destaca-se de quem mostra dez gráficos sem conclusão.',
      commonPitfall: 'Concluir mais do que os dados dizem: "o turismo faz subir as rendas" quando só viste que as duas coisas sobem nos mesmos municípios. Ou cortar o eixo das barras para a diferença parecer maior: um recrutador atento repara.',
      referenceTitle: 'Do número à recomendação',
      referenceRows: [
        { syntax: 'df.groupby("mes")["dormidas"].sum().sort_index()', meaning: 'Total de cada mês do calendário, com todos os anos somados. Com mes como número (1 a 12), as barras ficam por ordem; com nomes, ficavam por ordem alfabética', example: 'Dormidas de janeiro a dezembro' },
        { syntax: 'pico / media', meaning: 'Quantas vezes um valor está acima da referência', example: '2,3 vezes um mês médio' },
        { syntax: 'ax.bar(x, y); ax.set_ylim(bottom=0)', meaning: 'Barras com o eixo no zero', example: 'Quantidades por mês' },
        { syntax: 'ax.set_title("Conclusão em frase")', meaning: 'O título diz o que o gráfico mostra', example: '"Agosto vale mais do dobro de um mês médio"' },
        { syntax: 'fig.savefig("../figuras/dormidas_por_mes.png", dpi=150, bbox_inches="tight")', meaning: 'Guarda o gráfico para o README', example: 'figuras/dormidas_por_mes.png' },
        { syntax: 'Limites', meaning: 'O que os dados não permitem concluir', example: '"Associação, não causa; só 3 anos de dados"' },
      ],
      engine: 'projeto',
      exampleCode: `# cadernos/02_analise.ipynb: o número, o gráfico e a frase
from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd

# Colunas do ficheiro limpo: municipio, ano, mes (número de 1 a 12) e dormidas
df = pd.read_csv("../dados/limpo.csv")
MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
         "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"]

# 1) O número que responde à pergunta, com uma comparação.
# Total de cada mês do calendário, com todos os anos somados. mes é um número,
# por isso sort_index() põe os meses por ordem (com nomes, ficavam por ordem alfabética).
por_mes = df.groupby("mes")["dormidas"].sum().sort_index()
media = por_mes.mean()
pico = MESES[por_mes.idxmax() - 1]
vezes = f"{por_mes.max() / media:.1f}".replace(".", ",")
print(f"{pico}: {vezes} vezes a média mensal")

# 2) Um gráfico honesto: barras, eixo no zero, conclusão no título
fig, ax = plt.subplots(figsize=(8, 4))
ax.bar([MESES[m - 1][:3] for m in por_mes.index], por_mes.values)
ax.axhline(media, linestyle="--", color="grey", label="Média mensal")
ax.set_ylim(bottom=0)
ax.set_title(f"{pico.capitalize()} tem {vezes} vezes as dormidas de um mês médio")
ax.set_xlabel("Mês")
ax.set_ylabel("Dormidas (todos os anos somados)")
ax.legend()
Path("../figuras").mkdir(exist_ok=True)
fig.savefig("../figuras/dormidas_por_mes.png", dpi=150, bbox_inches="tight")

# 3) A recomendação numa frase com decisão
acima = ", ".join(MESES[m - 1] for m in por_mes[por_mes > media].index)
print(f"Reforçar o pessoal em {acima}: são os meses acima da média, com o pico em {pico}.")

# 4) Numa célula de texto, os limites:
# "Mostra quando há mais dormidas, não porquê. Só cobre os anos do ficheiro."`,
      projectSpec: {
        entregaveis: [
          'Um caderno cadernos/02_analise.ipynb que lê o ficheiro limpo e corre do início ao fim.',
          'O número que responde à pergunta, com a comparação que lhe dá sentido.',
          'Um gráfico guardado em PNG, com a conclusão no título.',
          'Uma recomendação numa frase e uma nota com os limites da análise.',
        ],
        lista: [
          'Calculei um número que responde diretamente à minha pergunta e comparei-o com uma referência (a média, outro período ou outra região).',
          'O meu gráfico de quantidades tem o eixo a começar no zero, eixos com unidades e a conclusão no título.',
          'Escrevi a recomendação numa frase com uma decisão e o número que a sustenta.',
          'Escrevi o que os meus dados não permitem concluir (causa, poucos casos, período ou cobertura).',
          'Quando comparei grupos de tamanhos diferentes, usei taxas ou percentagens em vez de totais.',
          'Mostrei o título do gráfico e a frase a alguém que não conhece os dados, e essa pessoa percebeu o que fazer.',
        ],
        grelha: [
          { criterio: 'Número', bom: 'Um número que responde à pergunta, comparado com uma referência: "2,3 vezes um mês médio".', aMelhorar: 'Uma tabela de totais sem comparação, ou dez números sem dizer qual importa.' },
          { criterio: 'Gráfico', bom: 'Um gráfico, uma mensagem: eixo no zero nas quantidades, conclusão no título e unidades nos eixos.', aMelhorar: 'Eixo cortado que exagera a diferença, título "Gráfico 1" ou cores sem significado.' },
          { criterio: 'Recomendação', bom: 'Uma frase com o quê, quando ou onde, e o número: alguém pode agir na segunda-feira.', aMelhorar: '"Os dados mostram tendências interessantes", ou uma conclusão sem decisão.' },
          { criterio: 'Limites', bom: 'Diz o que não se pode concluir: associação e não causa, poucos casos, período curto.', aMelhorar: 'Afirma uma causa a partir de uma correlação, ou esconde que há poucos dados.' },
          { criterio: 'Comparações justas', bom: 'Taxas ou percentagens quando os grupos têm tamanhos diferentes; mediana quando há valores extremos.', aMelhorar: 'Compara os totais de Lisboa com os de um município pequeno e conclui que Lisboa "é melhor".' },
        ],
      },
      quiz: {
        question: 'Nos teus dados, os municípios com mais alojamento local têm rendas mais altas. O que podes escrever na conclusão?',
        options: [
          '"O alojamento local faz subir as rendas."',
          '"Estão associados; estes dados sozinhos não mostram a causa."',
          '"Se proibirmos o alojamento local, as rendas descem."',
          '"Não se pode dizer nada sobre isto, porque correlação nunca é causa."',
        ],
        correctIndex: 1,
        explanation: 'Uma associação é um resultado verdadeiro e útil, mas pode ter uma terceira coisa por trás (por exemplo, serem municípios turísticos e centrais). Afirmar a causa, ou prometer o efeito de uma medida, pede outro tipo de estudo; dizer que não se pode concluir nada também está errado.',
      },
    },
    {
      id: 'pf-05-publicar',
      code: '05',
      title: 'Publicar: o README e o repositório que um recrutador abre',
      lede: 'Fechas o projeto: um README com a pergunta, as conclusões com números em formato português, os dados (fonte e licença) e como correr o projeto, um histórico de commits que se lê e o link do repositório. Um recrutador decide em 2 minutos: faz com que bastem.',
      analogyTitle: 'O currículo de uma página',
      analogyBody: 'Um recrutador lê um currículo em segundos e só chama para entrevista se a primeira página o convencer. O README é a primeira página do teu projeto: em cima, o que descobriste; a seguir, de onde vêm os dados e como confirmar; o resto fica nos cadernos, para quem quiser ver mais.',
      concepts: [
        'A ordem do README segue o modelo do exemplo publicado (github.com/GustakunPT/Course_DA/tree/main/exemplo-projeto-turismo-algarve): título com a pergunta, ## Pergunta, ## Conclusões, ## Dados (fonte, link, data e licença concreta), ## Limites, ## Como correr e ## Estrutura.',
        'Números em formato português: 1 234 567 dormidas, 12,5%, 3 456,78 €. Tira-os do caderno, não os escrevas de memória: um número que não bate certo com o caderno tira credibilidade a tudo o resto.',
        '"Como correr" tem de funcionar num computador limpo: um requirements.txt com as bibliotecas (pandas, matplotlib, jupyter), os comandos por ordem e, se os dados não estiverem no repositório, de onde se descarregam.',
        'Commits com mensagens que contam a história: "Limpeza: tira 12 linhas repetidas por município, ano e mês" diz muito mais do que "update" ou "final2". Um commit por passo.',
        'O repositório é público e tem um nome que diz o tema (turismo-algarve, não projeto-final-v3). No teu perfil do GitHub, destaca-o em "Customize your pins" e escreve uma descrição de uma linha.',
      ],
      beginnerSteps: [
        'Cria o requirements.txt com as bibliotecas principais que usaste.',
        'Escreve o README pela ordem da referência, com as conclusões tiradas do caderno e o gráfico de figuras/.',
        'Corre git log --oneline: se as mensagens não contam o que fizeste, os próximos commits passam a contar.',
        'Cria o repositório público no GitHub vazio, sem README nem licença (senão o primeiro envio é recusado). Depois, no terminal: git branch -M main (garante que o ramo se chama main), git remote add origin com o link do repositório e git push -u origin main.',
        'Abre o repositório numa janela privada do browser: o README aparece, o gráfico carrega e os links funcionam?',
        'Cola o link aqui em baixo e mostra o projeto a alguém, de cronómetro na mão: 2 minutos chegam?',
      ],
      proPractice: 'No CV e no LinkedIn, descreve o projeto numa linha com ação, ferramenta e resultado, seguida do link: "Analisei as dormidas do INE com pandas e mostrei em que meses um alojamento do Algarve precisa de mais pessoal." Na entrevista, conta-o pela ordem do README: pergunta, resultado, dados, limites.',
      commonPitfall: 'Um README que começa pela instalação ou pelo método, números que não batem certo com o caderno e um gráfico que não aparece porque o caminho aponta para uma pasta do teu computador (C:\\Users\\...). No README e nos cadernos, usa caminhos relativos ao repositório.',
      referenceTitle: 'O README de portefólio, secção a secção',
      referenceRows: [
        { syntax: '# Título com a pergunta', meaning: 'Diz logo o que o projeto responde', example: '# Turismo no Algarve: em que meses reforçar o pessoal?' },
        { syntax: '## Conclusões', meaning: '3 a 5 frases com números em formato português, a recomendação e o gráfico', example: '![Dormidas por mês](figuras/dormidas_por_mes.png)' },
        { syntax: '## Dados', meaning: 'Fonte, link, data de descarga, licença e linhas que saíram na limpeza', example: 'INE, descarregado a 17/11/2026' },
        { syntax: '## Limites', meaning: 'O que os dados não permitem concluir', example: 'Associação, não causa' },
        { syntax: '## Como correr', meaning: 'Comandos para repetir tudo num computador limpo', example: 'pip install -r requirements.txt' },
        { syntax: 'git branch -M main, git remote add origin <link> e git push -u origin main', meaning: 'Dá o nome main ao ramo, liga o repositório local ao do GitHub (criado vazio, sem README nem licença) e envia os commits', example: 'git remote add origin https://github.com/utilizador/turismo-algarve.git' },
      ],
      engine: 'projeto',
      exampleCode: `<!-- README.md: números de exemplo, troca-os pelos do teu caderno -->
# Turismo no Algarve: em que meses reforçar o pessoal?

## Pergunta
Em que meses deve um alojamento do Algarve reforçar o pessoal?
Quem decide: o gestor de um alojamento local.

## Conclusões
- Agosto tem 2,3 vezes as dormidas de um mês médio.
- De junho a setembro, as dormidas ficam acima da média do ano.
- Recomendação: reforçar o pessoal de junho a setembro, com o pico em agosto.

![Dormidas por mês](figuras/dormidas_por_mes.png)

## Dados
- Fonte: INE, Base de Dados via dados.gov.pt (link para o quadro usado).
- Descarregado a 17/11/2026. Licença: CC BY 4.0.
- 562 linhas depois da limpeza de 586 registos iniciais (saíram 10 duplicadas e 14 sem valor).

## Limites
Mostra quando há mais dormidas, não porquê. Só cobre os anos do ficheiro.

## Como correr
    pip install -r requirements.txt
    jupyter notebook
Abre cadernos/01_explorar_limpar.ipynb e depois cadernos/02_analise.ipynb.

## Estrutura
- dados/: ficheiro original e ficheiro limpo
- cadernos/: exploração, limpeza e análise
- figuras/: gráficos usados neste README`,
      projectSpec: {
        entregaveis: [
          'Um repositório público no GitHub com dados/ (ou instruções para os descarregar), cadernos/, figuras/, requirements.txt e README.md.',
          'Um README com a pergunta, as conclusões com números em formato português, os dados (fonte e licença), os limites e como correr.',
          'Um histórico de commits com mensagens que contam o que fizeste.',
          'O link do repositório, colado no campo em baixo.',
        ],
        lista: [
          'O meu README abre com a pergunta e as conclusões, com números em formato português tirados do caderno.',
          'O README diz a fonte dos dados, o link, a data de descarga e a licença.',
          'O README tem uma secção de limites com o que os dados não permitem concluir.',
          'Segui o "Como correr" numa pasta nova (ou noutro computador) e o projeto correu.',
          'As mensagens dos meus commits dizem o que mudou (nada de "update" ou "final2").',
          'Abri o repositório numa janela privada: é público, o README aparece e o gráfico carrega.',
          'O repositório não tem palavras-passe, chaves nem dados pessoais.',
        ],
        grelha: [
          { criterio: 'Primeiros 10 segundos', bom: 'O título e as primeiras linhas dizem a pergunta e o resultado principal, com um número.', aMelhorar: 'Abre com "Projeto final do curso" ou com as instruções de instalação.' },
          { criterio: 'Conclusões', bom: '3 a 5 frases com números em formato português, uma recomendação e o gráfico à vista.', aMelhorar: 'Descreve o método ("usei groupby") sem dizer o que descobriu.' },
          { criterio: 'Dados e honestidade', bom: 'Fonte com link, licença, linhas que saíram na limpeza e limites escritos.', aMelhorar: 'Sem fonte nem licença, ou conclusões mais fortes do que os dados permitem.' },
          { criterio: 'Reprodutível', bom: 'requirements.txt e comandos que funcionam num computador limpo, com caminhos relativos.', aMelhorar: 'Falta uma biblioteca, um caminho aponta para C:\\Users\\... ou o caderno só corre por uma ordem secreta.' },
          { criterio: 'Histórico e arrumação', bom: 'Um commit por passo com mensagens claras, um nome de repositório que diz o tema e as pastas arrumadas.', aMelhorar: 'Um só commit "Add files via upload", o nome "projeto-final-v3" e ficheiros soltos na raiz.' },
          { criterio: 'Comprimento', bom: 'Lê-se em 2 minutos; o detalhe fica nos cadernos, com links.', aMelhorar: 'Três ecrãs de texto, ou o caderno inteiro copiado para o README.' },
        ],
        pedirLinkGithub: true,
      },
      quiz: {
        question: 'Um recrutador abre o teu repositório e tem 2 minutos. O que deve ver primeiro no README?',
        options: [
          'As instruções de instalação, para poder correr o projeto',
          'A pergunta e a conclusão principal, com um número',
          'A lista de todas as bibliotecas e versões usadas no projeto',
          'O código da limpeza, para ver que sabes pandas',
        ],
        correctIndex: 1,
        explanation: 'Em 2 minutos o recrutador quer saber se fazes perguntas úteis e chegas a respostas com números. A instalação e as bibliotecas são para quem vai correr o projeto e ficam mais abaixo; o código está nos cadernos.',
      },
    },
    {
      id: 'pf-06-cv-linkedin',
      code: '06',
      title: 'CV de analista e LinkedIn: projetos com números',
      lede: 'Transformas o projeto que acabaste de publicar num CV de 1 página e num perfil de LinkedIn que passam pela triagem em 10 segundos — com resultados e números em vez de listas de ferramentas.',
      analogyTitle: 'A ementa vs o prato pronto',
      analogyBody: 'Escrever "Python, SQL, Power BI" numa lista é mostrar os ingredientes crus. Escrever "Analisei 20 300 viagens com pandas e identifiquei 3 estações que concentram 42% da procura" é servir o prato pronto: quem recruta vê logo o que consegues entregar.',
      concepts: [
        'Fórmula de cada linha de projeto no CV: Ação (verbo no passado) + Dados/Ferramenta + Resultado com número. Ex.: "Limpei e analisei 1 151 registos do INE com pandas e mostrei que junho a setembro concentram 61% das dormidas."',
        '1 página chega para analista júnior: nome, contacto + link do GitHub e LinkedIn, 2 a 3 projetos com números e link direto, experiência anterior (mesmo noutra área, destacando organização, atendimento ou metas) e formação.',
        'Evita barras de percentagem ("SQL: 80%"), fotos grandes ou tabelas complexas: os sistemas de triagem (ATS) lêem melhor texto simples em PDF.',
        'LinkedIn alinhado com o CV: título claro ("Analista de Dados Júnior | SQL · Python · Pandas · Power BI"), secção Sobre com 3 parágrafos curtos (o que resolves, 2 projetos com números, que vaga procuras) e projetos nos Destaques com imagem do gráfico e link do GitHub.',
      ],
      beginnerSteps: [
        'Escolhe 2 projetos (o teu projeto próprio da etapa Publicar e o desafio das bicicletas ou da mercearia) e escreve 2 linhas para cada um com a fórmula Ação + Ferramenta + Número.',
        'Monta um CV de 1 página em formato simples (Google Docs ou Word exportado para PDF) com links clicáveis para o GitHub e o LinkedIn.',
        'Atualiza o título e o "Sobre" do LinkedIn, e adiciona o link do repositório publicado na secção Destaques (Featured) com o gráfico do README.',
      ],
      proPractice: 'Se vens de outra área (comércio, hotelaria, saúde, administração), não escondas essa experiência: ela dá-te contexto de negócio que muitos recém-licenciados não têm. Liga-a a métricas, prazos e resolução de problemas.',
      commonPitfall: 'Listar 15 ferramentas que só viste num vídeo de 10 minutos, ou escrever "Projeto final de curso" sem dizer que problema resolveste nem que número encontraste.',
      referenceTitle: 'Antes e depois no CV e LinkedIn',
      referenceRows: [
        { syntax: 'Fraco: "Conhecimentos em Python, pandas e SQL."', meaning: 'Não prova que sabes aplicar a ferramenta a um problema real', example: 'Lista solta sem contexto' },
        { syntax: 'Forte: "Analisei 2 700 pedidos com SQL e pandas e isolei uma falha na App que explicava -17,4% na faturação."', meaning: 'Mostra ação, dados, ferramenta e impacto mensurável', example: 'Passa na triagem em segundos' },
        { syntax: 'Título LinkedIn: "Analista de Dados Júnior | SQL · Python · Power BI"', meaning: 'Aparece nas pesquisas dos recrutadores pelas palavras-chave certas', example: 'Evita títulos vagos como "Em transição de carreira"' },
        { syntax: 'Destaques (Featured) no LinkedIn', meaning: 'Mostra o gráfico e o link do GitHub logo no topo do perfil', example: '1 clique para ver o teu trabalho' },
      ],
      engine: 'projeto',
      exampleCode: `<!-- Modelo de CV (1 página, exportar para PDF) -->
# O Teu Nome
Lisboa / Remoto · email@exemplo.pt · linkedin.com/in/teu-perfil · github.com/teu-utilizador

## Resumo
Analista de Dados Júnior com prática em SQL, Python (pandas), Excel e Power BI.
Experiência prévia em [a tua área anterior], habituado a trabalhar com prazos e indicadores.

## Projetos de Análise de Dados
**Turismo no Algarve: planeamento sazonal** — github.com/teu-utilizador/turismo-algarve
- Limpei 1 200 registos oficiais do INE com Python/pandas, removendo 49 linhas inválidas e documentando as regras.
- Mostrei que agosto tem 2,3x as dormidas de um mês médio e entreguei recomendação de reforço de equipa com gráfico em matplotlib.

**Diagnóstico de queda de faturação (loja online)** — Python, SQLite, Estatística
- Cruzei 2 700 pedidos em SQL e pandas e identifiquei um salto de 3,4% para 44,9% nos cancelamentos da App (p < 0,001).

## Experiência Profissional
**[Cargo anterior] · [Empresa]** (AAAA–AAAA)
- [1 a 2 pontos curtos com números, metas ou melhoria de processos]

## Competências & Formação
SQL (JOINs, CTEs, Window Functions) · Python (pandas, matplotlib) · Excel & Power BI (DAX, Star Schema) · Git/GitHub`,
      projectSpec: {
        entregaveis: [
          'Um CV em PDF de 1 página com 2 a 3 projetos descritos com ação, ferramenta, número e link clicável.',
          'Perfil de LinkedIn atualizado: título profissional, resumo "Sobre" curto e projeto fixado nos Destaques.',
        ],
        lista: [
          'O meu CV cabe numa só página e está guardado em PDF com nome profissional (ex.: CV_Nome_AnalistaDados.pdf).',
          'Cada projeto no CV tem um link clicável para o GitHub e pelo menos um número concreto descoberto na análise.',
          'Não uso barras de percentagem para competências nem listo ferramentas que não consigo usar numa entrevista.',
          'O título do meu LinkedIn inclui "Analista de Dados" e as ferramentas principais (SQL, Python, Power BI/Excel).',
          'O meu projeto próprio publicado no GitHub está nos Destaques do LinkedIn com o link do repositório.',
        ],
        grelha: [
          { criterio: 'Impacto nos projetos', bom: 'Cada ponto começa com verbo de ação no passado, cita a ferramenta e fecha com um número e decisão.', aMelhorar: 'Diz apenas "Fiz um projeto sobre turismo" ou lista bibliotecas sem resultados.' },
          { criterio: 'Clareza e formato', bom: '1 página limpa, sem erros ortográficos, links clicáveis e fácil de ler em 10 segundos.', aMelhorar: '2–3 páginas, foto enorme, barras de "Python 75%" ou texto corrido sem secções.' },
          { criterio: 'Alinhamento CV–LinkedIn', bom: 'As datas, projetos e palavras-chave do LinkedIn batem certo com o CV e o GitHub.', aMelhorar: 'LinkedIn vazio ou desatualizado face ao CV enviado.' },
          { criterio: 'Honestidade técnica', bom: 'Só inclui competências que consegues explicar e demonstrar num teste ao vivo.', aMelhorar: 'Inclui tecnologias que nunca usaste só para encher.' },
        ],
      },
      quiz: {
        question: 'Qual destas descrições de projeto num CV chama mais a atenção de um recrutador para Analista de Dados Júnior?',
        options: [
          'Concluí um curso intensivo de Python, pandas, SQL e Power BI com 70 etapas.',
          'Projeto de vendas: usei Jupyter Notebook, pandas, groupby e matplotlib.',
          'Analisei 20 300 viagens de bicicleta com pandas, limpei 650 registos inválidos e identifiquei as 3 estações com 40% da procura.',
          'Tenho conhecimentos de nível 4/5 em Excel e 3/5 em SQL.',
        ],
        correctIndex: 2,
        explanation: 'Recrutadores procuram evidência do que fizeste com os dados: escala (20 300 viagens), método (limpeza + análise) e resultado concreto com número.',
      },
    },
    {
      id: 'pf-07-anuncios-entrevista',
      code: '07',
      title: 'Ler anúncios, entrevista comportamental e pitch de 2 minutos',
      lede: 'Sabes filtrar anúncios de emprego sem te autoexcluires, preparas as 4 respostas comportamentais mais pedidas com o método STAR e ensaias o pitch de 2 minutos do teu projeto.',
      analogyTitle: 'A lista de compras vs o essencial do jantar',
      analogyBody: 'Um anúncio de emprego é escrito como uma lista de desejos ideal, não como um exame eliminatório. Se cumpres 60% a 70% dos requisitos principais (quase sempre SQL, Excel/BI e saber comunicar), deves candidatar-te.',
      concepts: [
        'Como ler um anúncio em 3 minutos: separa os requisitos reais (os primeiros 3–4 pontos, quase sempre SQL, Excel/Power BI e comunicação) da lista de desejos ("valoriza-se Spark/Airflow/3 anos de experiência").',
        'O pitch de 2 minutos do teu projeto segue 4 passos: 1) Pergunta e quem decide; 2) Dados e um problema real que limpaste; 3) Resultado principal com número e recomendação; 4) Um limite que encontraste.',
        'Entrevista comportamental com método STAR: Situação (1 frase), Tarefa (o que tinhas de resolver), Ação (o que TU fizeste nos dados) e Resultado (o número ou decisão que saiu).',
        'No fim da entrevista, faz sempre 2 perguntas inteligentes: mostra interesse no negócio e ajuda-te a perceber se a equipa tem boas práticas.',
      ],
      beginnerSteps: [
        'Escolhe 3 anúncios reais de Analista de Dados Júnior e sublinha o que pedem em comum (repara quantas vezes aparece SQL + Excel/BI + comunicação).',
        'Escreve e grava no telemóvel o pitch de 2 minutos do teu projeto próprio da etapa Publicar (cronometra: tem de caber entre 90 e 120 segundos).',
        'Prepara 3 histórias curtas no formato STAR: um problema de dados sujos, um número que não batia certo e como explicaste uma conclusão a alguém não técnico.',
        'Anota 2 perguntas para fazeres ao entrevistador no final.',
      ],
      proPractice: 'Nas entrevistas técnicas e comportamentais, dizer "Não sei de cor a sintaxe exata, mas sei que resolveria com uma Window Function e validaria os nulos" vale muito mais do que inventar uma resposta.',
      commonPitfall: 'Desistir de uma candidatura porque pede "2 anos de experiência" quando o resto encaixa, ou passar 5 minutos a explicar o código do projeto sem nunca dizer a conclusão de negócio.',
      referenceTitle: 'Guião rápido para a entrevista',
      referenceRows: [
        { syntax: 'Pitch (0:00–0:30): Pergunta + Dados', meaning: 'Qual era o problema, quem decidia e que dados usaste', example: '"Queria saber em que meses reforçar equipa no Algarve usando dados do INE."' },
        { syntax: 'Pitch (0:30–1:30): Limpeza + Descoberta', meaning: 'Um desafio nos dados e o resultado principal com número', example: '"Tirei 49 linhas inválidas e vi que agosto tem 2,3x um mês médio."' },
        { syntax: 'Pitch (1:30–2:00): Recomendação + Limite', meaning: 'O que fazer na prática e o que os dados não provam', example: '"Recomendo reforço de junho a setembro; os dados não explicam a causa."' },
        { syntax: 'STAR: Situação · Tarefa · Ação · Resultado', meaning: 'Estrutura de 60–90 segundos para perguntas comportamentais', example: 'Foca 60% do tempo na Ação e no Resultado' },
      ],
      engine: 'projeto',
      exampleCode: `<!-- Guião do Pitch de 2 minutos (adapta ao teu projeto) -->
[0:00 - 0:25 | Pergunta e Dados]
"No meu projeto mais recente quis responder a uma pergunta prática: em que meses deve um alojamento no Algarve reforçar a equipa? Usei dados oficiais do INE com dormidas mensais por município."

[0:25 - 1:15 | Limpeza e Análise]
"Logo na exploração encontrei 37 linhas sem valor e 12 duplicadas por município e mês. Documentei a remoção em Python/pandas e calculei a sazonalidade face à média mensal."

[1:15 - 1:45 | Resultado e Recomendação]
"O resultado foi claro: agosto tem 2,3 vezes as dormidas de um mês médio, e de junho a setembro ficam sempre acima da média. A recomendação prática é concentrar contratações sazonais nesses 4 meses."

[1:45 - 2:00 | Limite e Próximo Passo]
"O limite é que estes dados mostram quando há procura, mas não os preços nem o lucro líquido — esse seria o meu próximo cruzamento se tivesse acesso aos dados internos da empresa."

<!-- 2 Perguntas para fazeres no fim da entrevista -->
1. "Qual é o maior problema de qualidade de dados ou reporting que a equipa quer resolver nos próximos 3 meses?"
2. "Como costumam validar se os números de um novo dashboard batem certo com a base de dados?"`,
      projectSpec: {
        entregaveis: [
          'Guião escrito e ensaiado (em 90–120 segundos) do pitch do teu projeto próprio.',
          'Notas de 3 histórias STAR para perguntas comportamentais + 2 perguntas para o entrevistador.',
        ],
        lista: [
          'Li pelo menos 3 anúncios reais de Analista de Dados Júnior e identifiquei as ferramentas e competências pedidas em comum.',
          'Cronometrei o pitch do meu projeto: cabe em 2 minutos e abre com a pergunta e a conclusão com número.',
          'No pitch digo pelo menos um problema de limpeza que resolvi e um limite dos dados.',
          'Tenho 3 histórias escritas no formato STAR (incluindo "como lidei com um número que não batia certo").',
          'Tenho 2 perguntas preparadas para fazer à empresa no final da entrevista.',
        ],
        grelha: [
          { criterio: 'Pitch em 2 minutos', bom: 'Vai direto à pergunta, mostra 1–2 números concretos, dá recomendação e reconhece um limite.', aMelhorar: 'Perde-se a explicar imports ou demora mais de 3 minutos sem dizer a conclusão.' },
          { criterio: 'Histórias STAR', bom: 'Mostram o que TU fizeste passo a passo nos dados e fecham com o impacto ou aprendizagem.', aMelhorar: 'Respostas genéricas ("sou muito perfecionista") sem exemplo concreto.' },
          { criterio: 'Leitura de anúncios', bom: 'Distingue requisitos centrais (SQL, BI, comunicação) de extras e candidata-se com 60–70% de encaixe.', aMelhorar: 'Espera cumprir 100% da lista de desejos antes de enviar o primeiro CV.' },
          { criterio: 'Postura de analista', bom: 'Faz perguntas sobre o negócio e qualidade dos dados da equipa no fim da conversa.', aMelhorar: 'Não tem nenhuma pergunta para fazer ao entrevistador.' },
        ],
      },
      quiz: {
        question: 'Um anúncio para Analista de Dados Júnior pede SQL, Excel, Power BI, comunicação com equipas de negócio e "valoriza-se experiência com Spark e Airflow". Dominas SQL, Excel, Power BI e Python, mas nunca usaste Spark nem Airflow. O que deves fazer?',
        options: [
          'Não te candidatar e estudar Spark e Airflow durante mais 3 meses primeiro.',
          'Escrever no CV que tens experiência profissional com Spark e Airflow.',
          'Candidatar-te já, destacando os teus projetos em SQL, Power BI e Python, porque cumpres os requisitos principais.',
          'Enviar o CV sem mencionar projetos, apenas com a lista de ferramentas.',
        ],
        correctIndex: 2,
        explanation: '"Valoriza-se" significa extra desejável, não obrigatório. Os requisitos principais de um analista júnior são SQL, Excel/BI e comunicação; cumprir 60–70% do anúncio é o ponto certo para avançar.',
      },
    },
  ],
};
