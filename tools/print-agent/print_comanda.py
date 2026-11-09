"""Agente local de impressão para Bematech MP-4200 TH / Windows.
Modo seguro inicial: apenas imprime um JSON de teste local.
Não busca pedidos reais e não decide confirmação de pagamento.
Requer pywin32: py -m pip install pywin32
"""
import argparse
import json
import sys
import uuid
from pathlib import Path

def clean(value, limit=80):
    text = str(value if value is not None else "").replace("\r", " ").replace("\n", " ")
    return "".join(ch for ch in text if ch.isprintable())[:limit]

def receipt(order):
    if not isinstance(order, dict):
        raise ValueError("Comanda inválida")
    if not isinstance(order.get("items"), list) or not order["items"]:
        raise ValueError("Comanda sem itens")
    lines = ["TAMANDARE CLUB", "COMANDA DE PREPARO", "-" * 40,
             "Pedido: " + clean(order.get("order_id", ""), 32),
             "Mesa: " + clean(order.get("table", "Sem mesa")),
             "Cliente: " + clean(order.get("customer", "Nao informado")),
             "Horario: " + clean(order.get("created_at", "")),
             "-" * 40]
    for item in order["items"]:
        if not isinstance(item, dict):
            raise ValueError("Item inválido")
        quantity = int(item.get("quantity", 0))
        if quantity < 1 or quantity > 999:
            raise ValueError("Quantidade inválida")
        lines.append(f'{quantity}x {clean(item.get("name", "Produto"), 33)}')
        if item.get("notes"):
            lines.append("  Obs: " + clean(item["notes"], 70))
    lines += ["-" * 40, "SOMENTE PARA PREPARO", "", "", ""]
    return ("\r\n".join(lines) + "\r\n").encode("cp850", errors="replace")

def print_raw(printer, payload):
    try:
        import win32print
    except ImportError as err:
        raise RuntimeError("Instale pywin32: py -m pip install pywin32") from err
    handle = win32print.OpenPrinter(printer)
    try:
        job = win32print.StartDocPrinter(handle, 1, ("Tamandare Club - teste", None, "RAW"))
        try:
            win32print.StartPagePrinter(handle)
            win32print.WritePrinter(handle, payload)
            win32print.EndPagePrinter(handle)
        finally:
            win32print.EndDocPrinter(handle)
        return job
    finally:
        win32print.ClosePrinter(handle)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--printer", help="Nome exato da impressora no Windows")
    parser.add_argument("--sample", default=str(Path(__file__).with_name("comanda-exemplo.json")))
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    data = json.loads(Path(args.sample).read_text(encoding="utf-8"))
    payload = receipt(data)
    if args.dry_run:
        sys.stdout.buffer.write(payload)
        return
    if not args.printer:
        parser.error("--printer é obrigatório para imprimir")
    job = print_raw(args.printer, payload)
    print("Teste enviado à fila do Windows. Job:", job)

if __name__ == "__main__":
    main()
