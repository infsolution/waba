# AGENTS.md

Este projeto é uma API REST desenvolvida com Laravel (versão mais recente estável), PHP e banco de dados relacional.

O objetivo deste arquivo é definir regras para agentes de IA que trabalham neste projeto. As instruções abaixo devem ser seguidas em qualquer alteração, implementação, refatoração ou correção.

---

## 1. Princípios gerais

- Antes de alterar código, entenda a implementação existente e siga os padrões já estabelecidos no projeto.
- Não introduza uma nova arquitetura, biblioteca ou padrão sem necessidade.
- Prefira soluções simples, idiomáticas e nativas do Laravel.
- Reutilize código existente antes de criar novas abstrações.
- Não duplique regras de negócio.
- Não altere contratos públicos da API sem avaliar compatibilidade com os consumidores existentes.
- Não remova funcionalidades existentes sem uma solicitação explícita.
- Evite mudanças não relacionadas ao objetivo da tarefa.
- Preserve compatibilidade com o código existente sempre que possível.
- Se houver conflito entre estas instruções e o código existente, priorize a consistência com a arquitetura atual e sinalize a divergência antes de fazer uma mudança estrutural.

## 2. Stack e tecnologias

A aplicação utiliza:

- PHP na versão suportada pela versão atual do Laravel.
- Laravel na versão mais recente estável adotada pelo projeto.
- Composer para gerenciamento de dependências PHP.
- Laravel Eloquent para persistência.
- Laravel Migrations para versionamento do banco.
- Laravel Form Requests para validação.
- Laravel API Resources quando houver necessidade de transformação das respostas.
- PHPUnit/Pest conforme a configuração existente no projeto.
- Artisan para comandos e tarefas relacionadas ao framework.

### Regras

- Não fixe versões de dependências manualmente sem verificar a compatibilidade com a versão atual do Laravel.
- Antes de adicionar uma dependência, verifique se o Laravel ou o PHP já oferece uma solução adequada.
- Utilize as ferramentas oficiais do Laravel sempre que forem suficientes.
- Não introduza bibliotecas alternativas para resolver problemas que já possuem solução nativa.

## 3. Estrutura do projeto

Siga a estrutura padrão do Laravel sempre que possível:

```text
app/
├── Console/
├── Exceptions/
├── Http/
│   ├── Controllers/
│   ├── Middleware/
│   ├── Requests/
│   └── Resources/
├── Models/
├── Policies/
├── Providers/
└── Services/

database/
├── factories/
├── migrations/
└── seeders/

routes/
├── api.php
└── web.php

tests/
├── Feature/
└── Unit/
```

Não crie estruturas paralelas ou pastas customizadas sem necessidade arquitetural clara.

## 4. Arquitetura

A aplicação deve seguir uma separação clara de responsabilidades.

### Controllers

Controllers devem ser finos.

Responsabilidades:

- Receber a requisição.
- Delegar validação ao Form Request.
- Acionar a regra de negócio apropriada.
- Retornar a resposta HTTP adequada.

Evite colocar nos Controllers:

- Regras de negócio complexas.
- Consultas SQL extensas.
- Validações manuais.
- Processamento pesado.
- Integrações externas diretamente.

Exemplo:

```php
public function store(StoreUserRequest $request)
{
    $user = $this->userService->create($request->validated());

    return new UserResource($user);
}
```

### Services

Utilize Services quando houver:

- Regras de negócio complexas.
- Fluxos envolvendo múltiplas entidades.
- Integrações externas.
- Operações que precisam ser reutilizadas.
- Processos que não pertencem naturalmente ao Controller ou Model.

Não crie Services apenas para encapsular chamadas triviais ao Eloquent.

### Models

Models devem representar entidades e seus comportamentos relacionados ao domínio.

Utilize:

- Relationships.
- Casts.
- Scopes.
- Accessors/Mutators quando apropriado.
- Métodos de domínio simples.

Evite transformar Models em classes excessivamente complexas.

### Repositories

Não crie Repository por padrão.

O Eloquent já fornece uma camada de abstração adequada para a maioria dos casos.

Crie Repository somente quando houver uma necessidade concreta, como:

- múltiplas fontes de dados;
- abstração necessária para testes;
- consultas significativamente complexas;
- necessidade arquitetural já adotada pelo projeto.

## 5. Rotas da API

As rotas REST devem seguir convenções HTTP.

Preferir:

```text
GET    /api/users
GET    /api/users/{user}
POST   /api/users
PUT    /api/users/{user}
PATCH  /api/users/{user}
DELETE /api/users/{user}
```

Utilize `Route::apiResource()` quando o CRUD seguir o padrão REST.

Exemplo:

```php
Route::apiResource('users', UserController::class);
```

### Regras

- Utilize substantivos nas URLs.
- Evite verbos nas URLs quando uma operação HTTP adequada existir.
- Utilize nomes no plural para recursos.
- Utilize status HTTP semanticamente corretos.
- Não utilize `POST` para todas as operações.
- Evite endpoints excessivamente específicos sem necessidade.

## 6. Controllers e respostas HTTP

As respostas devem utilizar códigos HTTP apropriados.

Exemplos:

```text
200 OK              - consulta ou atualização bem-sucedida
201 Created         - recurso criado
204 No Content      - operação concluída sem conteúdo
400 Bad Request     - requisição inválida
401 Unauthorized    - autenticação necessária/inválida
403 Forbidden       - usuário autenticado sem permissão
404 Not Found       - recurso inexistente
422 Unprocessable   - erro de validação
429 Too Many        - rate limit
500 Internal        - erro inesperado
```

Não retorne `200` para erros apenas para manter uma estrutura de resposta uniforme.

## 7. Validação

Utilize Form Requests para validação de entrada.

Exemplo:

```php
class StoreUserRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
        ];
    }
}
```

### Regras

- Nunca confie em dados enviados pelo cliente.
- Valide toda entrada externa.
- Não coloque validações complexas diretamente no Controller.
- Utilize regras nativas do Laravel sempre que possível.
- Regras de autorização devem ficar em Policies/Gates, não misturadas com validação de dados.

## 8. API Resources

Quando a API possuir um contrato de resposta definido, utilize API Resources para controlar a representação dos dados.

Evite retornar Models diretamente quando isso expuser:

- atributos internos;
- informações sensíveis;
- campos que não fazem parte do contrato;
- estruturas acidentalmente dependentes do banco.

Exemplo:

```php
return new UserResource($user);
```

Não utilize:

```php
return response()->json($user);
```

quando o projeto já estiver utilizando Resources para aquele recurso.

## 9. Banco de dados

Utilize Eloquent e Migrations.

### Migrations

- Toda alteração estrutural do banco deve ser feita através de Migration.
- Nunca altere manualmente a estrutura do banco como substituição à Migration.
- Migrations devem ser reversíveis sempre que possível.
- Utilize nomes descritivos.
- Defina índices para campos frequentemente utilizados em filtros, joins e buscas.
- Utilize foreign keys quando apropriado.

### Queries

Prefira:

```php
User::query()
    ->where('active', true)
    ->latest()
    ->get();
```

Evite SQL bruto quando Eloquent ou Query Builder forem suficientes.

Quando SQL bruto for realmente necessário:

- utilize parâmetros vinculados;
- nunca concatene input do usuário diretamente na query;
- documente a razão da utilização.

## 10. Performance e Eloquent

Evite N+1 queries.

Prefira eager loading:

```php
User::with('orders')->get();
```

Em consultas grandes:

- utilize paginação;
- selecione somente as colunas necessárias;
- considere `chunk`, `lazy` ou `cursor` quando apropriado;
- evite carregar grandes volumes de dados em memória.

Não utilize `Model::all()` em endpoints que podem retornar grandes quantidades de registros.

Prefira:

```php
User::query()->paginate(20);
```

## 11. Autenticação e autorização

A autenticação deve utilizar o mecanismo adotado pelo projeto.

Não implemente autenticação manual quando houver uma solução oficial ou já existente.

Autorização deve utilizar:

- Policies;
- Gates;
- Middleware;

conforme o caso.

Nunca confie em IDs enviados pelo cliente para determinar se um usuário pode acessar determinado recurso.

Exemplo:

```php
$this->authorize('update', $user);
```

## 12. Segurança

Segurança é prioridade.

### Nunca

- Comitar `.env`.
- Expor secrets.
- Expor tokens.
- Expor senhas.
- Logar credenciais.
- Retornar informações sensíveis nas respostas da API.
- Confiar em dados enviados pelo cliente.
- Montar SQL concatenando input do usuário.
- Desabilitar proteções de segurança para "fazer funcionar".

### Configuração

Utilize:

```php
config('services.example.key');
```

em vez de acessar `env()` diretamente na aplicação.

`env()` deve ser utilizado principalmente nos arquivos de configuração.

### Logs

Não registre:

- passwords;
- tokens;
- API keys;
- secrets;
- dados pessoais desnecessários.

## 13. Exceptions e tratamento de erros

Não utilize `try/catch` indiscriminadamente.

Deixe o Laravel tratar exceções automaticamente quando não houver necessidade de recuperação local.

Utilize exceções específicas quando uma regra de negócio precisar comunicar uma falha conhecida.

Não retorne stack traces ou detalhes internos da aplicação em produção.

As respostas de erro da API devem ser consistentes com o padrão já adotado pelo projeto.

## 14. Transações

Utilize transações quando uma operação envolver múltiplas alterações que precisam ser atômicas.

Exemplo:

```php
DB::transaction(function () {
    // operações relacionadas
});
```

Não utilize transações desnecessariamente em operações simples.

## 15. Jobs, Queues e tarefas assíncronas

Utilize Jobs para operações que:

- demoram;
- fazem chamadas externas;
- processam grandes volumes;
- podem ser executadas de forma assíncrona;
- não precisam bloquear a resposta HTTP.

Exemplos:

- envio de e-mails;
- processamento de arquivos;
- integração com APIs externas;
- geração de relatórios;
- processamento pesado.

Evite executar tarefas demoradas diretamente dentro de Controllers.

## 16. Integrações externas

Integrações com APIs externas devem ser isoladas da camada HTTP.

Sempre que apropriado:

- encapsule a integração em uma classe específica;
- utilize o HTTP Client do Laravel;
- configure credenciais via `.env`/config;
- defina timeouts;
- trate falhas;
- registre logs úteis sem expor secrets.

Não espalhe chamadas HTTP externas por vários Controllers.

## 17. Testes

Toda nova regra de negócio relevante deve possuir testes.

Priorize:

- Feature Tests para endpoints;
- Unit Tests para regras isoladas;
- testes de autorização;
- testes de validação;
- testes de cenários de erro;
- testes de integrações críticas.

Exemplo de teste de API:

```php
$response = $this->postJson('/api/users', [
    'name' => 'John Doe',
    'email' => 'john@example.com',
]);

$response
    ->assertCreated()
    ->assertJsonStructure([
        'data' => [
            'id',
            'name',
            'email',
        ],
    ]);
```

Ao corrigir um bug, sempre que possível crie um teste que reproduza o problema antes da correção.

Não altere testes apenas para fazê-los passar. Primeiro determine se o código ou o teste está incorreto.

## 18. Factories e Seeders

Utilize Model Factories para dados de teste.

Evite criar objetos de teste manualmente quando uma Factory existente puder ser utilizada.

Seeders devem ser utilizados para dados necessários ao ambiente da aplicação.

Não coloque dados sensíveis ou credenciais reais em Seeders.

## 19. Formatação e estilo

Siga o estilo existente no projeto.

Quando disponível, utilize Laravel Pint para formatação:

```bash
./vendor/bin/pint
```

Preferências:

- PSR-12;
- tipagem explícita;
- métodos pequenos;
- nomes descritivos;
- early returns quando melhorarem a legibilidade;
- evitar comentários óbvios;
- comentários devem explicar decisões, não repetir o código.

Exemplo:

```php
if (! $user) {
    return null;
}
```

Prefira isso a estruturas profundamente aninhadas quando a lógica permitir.

## 20. Tipagem PHP

Utilize tipagem forte sempre que possível.

Preferir:

```php
public function find(int $id): ?User
```

em vez de:

```php
public function find($id)
```

Utilize:

- tipos de parâmetros;
- tipos de retorno;
- propriedades tipadas;
- enums quando representarem estados finitos;
- DTOs quando houver necessidade real de transportar estruturas complexas.

Evite `mixed` quando um tipo mais específico puder ser utilizado.

## 21. Configuração e ambiente

Nunca faça commit de:

```text
.env
.env.*
```

quando contiverem informações sensíveis.

Utilize `.env.example` para documentar variáveis necessárias.

Ao adicionar uma nova variável de ambiente:

1. Adicione-a ao `.env.example`.
2. Adicione a configuração correspondente em `config/`.
3. Utilize `config()` no código da aplicação.
4. Documente a finalidade da variável quando necessário.

## 22. API versioning

Se o projeto utilizar versionamento, mantenha a estrutura definida pelo projeto.

Exemplo:

```text
/api/v1/users
/api/v1/orders
```

Não introduza uma nova versão da API apenas para pequenas alterações internas.

Mudanças breaking devem ser avaliadas cuidadosamente.

## 23. Compatibilidade e mudanças breaking

Antes de alterar:

- nomes de campos;
- tipos de dados;
- estrutura JSON;
- códigos HTTP;
- parâmetros;
- endpoints;
- regras de autenticação;

verifique os consumidores existentes.

Quando uma mudança breaking for necessária, deixe isso explícito na implementação e documentação.

## 24. Documentação da API

Quando o projeto possuir documentação OpenAPI/Swagger, mantenha-a sincronizada com a implementação.

Ao criar ou alterar endpoint:

- atualize a documentação correspondente;
- documente parâmetros;
- documente respostas;
- documente erros relevantes;
- documente autenticação quando necessário.

Não invente endpoints ou contratos que não existam na implementação.

## 25. Comandos e verificação

Antes de considerar uma alteração concluída, execute os checks disponíveis no projeto.

Preferencialmente:

```bash
php artisan test
./vendor/bin/pint --test
```

Quando aplicável:

```bash
php artisan route:list
php artisan migrate --pretend
```

Se o projeto possuir ferramentas adicionais de análise estática, lint ou CI, utilize-as conforme a configuração existente.

Não execute comandos destrutivos como:

```bash
php artisan migrate:fresh
php artisan db:wipe
```

sem solicitação explícita.

## 26. Git

Faça alterações pequenas e focadas.

Não:

- altere arquivos não relacionados à tarefa;
- reescreva histórico;
- force push;
- remova branches;
- faça commits automaticamente sem solicitação;
- altere configurações de CI/CD sem necessidade.

Antes de modificar código, considere o estado atual do Git para evitar sobrescrever alterações existentes.

Nunca descarte alterações feitas pelo usuário.

## 27. Processo para implementar uma tarefa

Ao receber uma tarefa:

1. Entenda o requisito.
2. Inspecione a estrutura relevante do projeto.
3. Identifique implementações existentes relacionadas.
4. Verifique Models, Controllers, Requests, Resources, Services, Policies e testes envolvidos.
5. Escolha a menor alteração capaz de resolver o problema.
6. Implemente seguindo os padrões existentes.
7. Adicione ou atualize testes.
8. Execute os testes relevantes.
9. Execute o formatter/linter disponível.
10. Revise o diff.
11. Verifique se nenhuma alteração não relacionada foi introduzida.
12. Informe claramente o que foi alterado e quais verificações foram executadas.

## 28. Regra para decisões arquiteturais

Não introduza complexidade antecipadamente.

Antes de criar:

- Repository;
- DTO;
- Service;
- Interface;
- Abstract Class;
- Design Pattern;
- Event;
- Listener;
- Observer;
- Trait;

verifique se existe uma necessidade concreta.

A abstração deve resolver um problema real, e não apenas seguir um padrão por convenção.

## 29. Regra para código existente

Não refatore código fora do escopo da tarefa apenas porque ele poderia ser melhorado.

Se encontrar um problema não relacionado:

- não o corrija automaticamente;
- mencione-o ao final, se for relevante;
- proponha uma tarefa separada quando necessário.

Priorize uma alteração pequena, previsível e fácil de revisar.

## 30. Regra de ouro

Sempre prefira:

> Código simples, idiomático, testável, seguro e consistente com o Laravel e com a arquitetura já existente.

Antes de criar algo novo, procure primeiro uma solução existente no projeto.

Antes de adicionar uma dependência, verifique se o Laravel ou o PHP já resolve o problema.

Antes de alterar um contrato da API, considere seus consumidores.

Antes de finalizar, execute os testes e revise o diff.
