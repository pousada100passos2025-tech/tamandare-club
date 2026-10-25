# Tamandaré Club — Integração PDV / Supabase

Supabase project: `wudqixnobxjziosqnzuy` (sa-east-1)

## Estado atual
O banco PostgreSQL foi inicializado com as tabelas `club_staff`, `club_customers`, `club_tables`, `club_products`, `club_events`, `club_tabs`, `club_orders`, `club_order_items`, `club_payments` e `club_audit` pela migração `club_pdv_secure_foundation`.

RLS está habilitado em todas elas. O acesso de clientes aos dados transacionais permanece bloqueado por padrão: não há grants para `anon` e só existe política de leitura do próprio perfil na tabela de funcionários. **Isto não é um PDV operacional ainda.**

## Próximos passos obrigatórios
1. Configurar conexão Supabase no servidor com segredos em variáveis de ambiente, jamais no GitHub; integrar Supabase Auth e associação de perfis administrativos por operador autorizado.
2. Implementar endpoints com autorização no servidor para abrir comanda por mesa ou cliente, adicionar itens usando preço do banco, fechar comanda com cálculo atômico e registrar responsável/operador e auditoria.
3. Implementar confirmação de dinheiro pelo caixa autorizado, controle de troco e caixa; pagamento misto e referência de provedor para Pix/cartões.
4. Integrar o Asaas com webhooks verificados, checagem idempotente e conciliação; nos dias de show bloquear preparo e entrega até pagamento integral confirmado.
5. Implementar interfaces móveis de garçom/caixa, mapa de mesas 2D e sincronização Realtime; deixar 3D como representação, não fonte da verdade.
6. Criar políticas/grants explícitos e minimizados ou manter acesso exclusivamente server-side; validar RLS, revogação, segurança de cliente e condição de corrida.
7. Executar testes e homologação antes do deploy em produção.

## Segurança
Não disponibilizar transações diretamente pelo navegador sem políticas específicas. Não aceitar valores ou confirmação de pagamento provenientes apenas do cliente. Não confundir registro da tarefa com publicação.
