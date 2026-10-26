# Impressão de comandas: Bematech MP-4200 TH (Windows 10 + USB)

Esta é a **primeira etapa local**, isolada do site público e do Supabase. **Não imprime compras reais automaticamente**.

## Teste local, sem imprimir
1. No computador com a Bematech conectada, instale Python e rode:
   `py tools/print-agent/print_comanda.py --dry-run`
2. Confira no terminal se aparecem **Mesa 01** e **Cliente de teste**.

## Impressão de teste
1. Verifique em `control printers` o **nome exato** da impressora no Windows (pode ser `MP-4200 TH`).
2. Instale a dependência local: `py -m pip install pywin32`.
3. Com papel carregado, execute:
   `py tools/print-agent/print_comanda.py --printer "MP-4200 TH"`
   Substitua pelo nome exato do seu Windows. Será enviado um documento RAW ao spooler. O driver Generic / Text Only pode aceitar texto; comportamento de corte e acentos deve ser validado no equipamento.

## Arquitetura pendente para pedidos reais
- Um **endpoint de servidor autenticado** deve receber evento Asaas validado, verificar o valor integral e criar uma tarefa única de impressão por pedido.
- Um **agente Windows autenticado** buscará somente tarefas liberadas para a unidade, confirmará impressão e fará retentativas com deduplicação.
- Não colocar chave administrativa do Supabase no computador, navegador ou GitHub. O agente deve usar credencial de escopo restrito e rotação.
- Dias de show: somente pedido integralmente pago gera comanda de preparo; demais dias seguem regra operacional definida.
- Em queda de energia/rede, a fila local precisa persistir e conciliá-la ao reconectar. Serviço compartilhado não está implementado aqui.
- Não usar este protótipo com pedidos de produção antes de implementar autenticação, fila persistente, confirmação de pagamentos e testes ponta a ponta.

Windows 10 sem atualizações de segurança regulares deve ser tratado como risco operacional; planeje migração para versão suportada.
