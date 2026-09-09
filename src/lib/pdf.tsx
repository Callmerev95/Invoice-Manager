import {
  Document,
  Image,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { formatRupiah, formatDate } from "@/lib/invoices";

export type PdfInvoice = {
  status: string;
  number: string;
  invoiceTitle: string;
  clientName: string;
  clientEmail: string | null;
  clientAddress: string | null;
  issueDate: string | null;
  dueDate: string;
  businessName: string | null;
  businessLine: string | null;
  businessAddress: string | null;
  businessEmail: string | null;
  businessPhone: string | null;
  businessWebsite: string | null;
  footerNote: string | null;
  paymentTerms: string | null;
  paymentTo: string | null;
  signatureText: string | null;
  signatureImagePath: string | null;
  signatureImageDataUri: string | null;
  logoPath: string | null;
  logoDataUri: string | null;
  accentColor: string | null;
  taxLabel: string;
  items: {
    description: string;
    quantity: number;
    unitPriceSen: number;
    subtotalSen: number;
  }[];
  subtotalSen: number;
  taxSen: number;
  adjustmentSen: number;
  paidSen: number;
  balanceSen: number;
  hasAdjustment: boolean;
  effectiveStatus: "draft" | "issued" | "overdue" | "paid";
};

const colors = {
  ink: "#16302A",
  muted: "#5B6F68",
  faint: "#8AA09A",
  line: "#D9E2DE",
  accent: "#17A674",
  accentSoft: "#E9F7F1",
  danger: "#B33A3A",
};

const spacer = (w: number) => ({ width: w });

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: colors.ink,
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: 1,
    borderBottomColor: colors.line,
    paddingBottom: 18,
  },
  brandName: { fontSize: 17, fontWeight: 700 },
  brandLogo: { width: 96, marginBottom: 8 },
  brandLine: { fontSize: 8.5, color: colors.muted, marginTop: 2 },
  brandMeta: { fontSize: 7.5, color: colors.muted, marginTop: 1.5 },
  wordmark: {
    fontSize: 12,
    letterSpacing: 4,
    fontWeight: 700,
    color: colors.accent,
    textTransform: "uppercase",
  },
  invoiceNo: {
    fontSize: 13,
    fontWeight: 700,
    textAlign: "right",
    marginTop: 3,
  },
  metaRow: {
    flexDirection: "row",
    marginTop: 22,
  },
  col: { flex: 1 },
  metaTitle: {
    fontSize: 7.5,
    letterSpacing: 1.5,
    color: colors.faint,
    textTransform: "uppercase",
    fontWeight: 700,
    marginBottom: 6,
  },
  clientName: { fontSize: 11, fontWeight: 700, marginBottom: 2 },
  clientLine: { fontSize: 8.5, color: colors.muted, marginTop: 1 },
  metaItem: {
    flexDirection: "row",
    marginTop: 3,
  },
  metaKey: { width: 70, color: colors.muted },
  metaValue: { fontWeight: 600 },
  statusBadge: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    fontSize: 7.5,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  itemsTable: { marginTop: 26 },
  itemHeader: {
    flexDirection: "row",
    borderBottom: 1,
    borderBottomColor: colors.ink,
    paddingBottom: 5,
    fontSize: 7.5,
    letterSpacing: 1,
    color: colors.faint,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  itemRow: {
    flexDirection: "row",
    borderBottom: 1,
    borderBottomColor: colors.line,
    paddingVertical: 7,
    alignItems: "center",
  },
  cellNo: { width: 24, color: colors.faint },
  cellDesc: { flex: 1, paddingRight: 10 },
  cellDescTitle: { fontSize: 9.5, fontWeight: 600 },
  cellQty: { width: 66, textAlign: "right", color: colors.muted },
  cellPrice: { width: 90, textAlign: "right", color: colors.muted },
  cellSub: { width: 96, textAlign: "right", fontWeight: 600 },
  totals: {
    marginTop: 14,
    alignSelf: "flex-end",
    width: 240,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 3,
    fontSize: 9,
    color: colors.muted,
  },
  totalRowStrong: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 7,
    borderTop: 1,
    borderTopColor: colors.ink,
    paddingTop: 7,
    fontSize: 12,
    fontWeight: 700,
    color: colors.ink,
  },
  totalRowNegative: { flexDirection: "row", justifyContent: "space-between", marginTop: 3, fontSize: 9, color: colors.danger },
  noteBox: {
    marginTop: 24,
    backgroundColor: colors.accentSoft,
    borderRadius: 6,
    padding: 12,
  },
  noteTitle: {
    fontSize: 7.5,
    letterSpacing: 1.2,
    color: colors.accent,
    fontWeight: 700,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  noteText: { fontSize: 8.5, color: colors.ink },
  sections: { marginTop: 22, color: colors.muted, fontSize: 8.5 },
  sectionTitle: {
    fontSize: 7.5,
    letterSpacing: 1.2,
    color: colors.faint,
    fontWeight: 700,
    textTransform: "uppercase",
    marginBottom: 4,
    marginTop: 10,
  },
  signature: { marginTop: 40, color: colors.muted },
  signatureImage: { height: 44, marginBottom: 4 },
  signatureName: { marginTop: 34, fontSize: 10, fontWeight: 700, color: colors.ink },
  footer: {
    marginTop: 34,
    borderTop: 1,
    borderTopColor: colors.line,
    paddingTop: 10,
    textAlign: "center",
    fontSize: 7.5,
    color: colors.faint,
  },
});

const STATUS_LABEL: Record<PdfInvoice["effectiveStatus"], { text: string; color: string; bg: string }> = {
  draft: { text: "Draft", color: colors.ink, bg: "transparent" },
  issued: { text: "Terbit", color: colors.accent, bg: colors.accentSoft },
  overdue: { text: "Lewat jatuh tempo", color: colors.danger, bg: "#FBEAEA" },
  paid: { text: "Lunas", color: colors.accent, bg: colors.accentSoft },
};

export async function renderInvoicePdf(vm: PdfInvoice): Promise<ArrayBuffer> {
  const status = STATUS_LABEL[vm.effectiveStatus];
  const accent =
    vm.accentColor && /^#[0-9a-fA-F]{6}$/.test(vm.accentColor)
      ? vm.accentColor
      : colors.accent;

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            {vm.logoDataUri ? (
              // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt prop
              <Image src={vm.logoDataUri} style={styles.brandLogo} />
            ) : null}
            <Text style={styles.brandName}>{vm.businessName || vm.invoiceTitle}</Text>
            {vm.businessLine ? <Text style={styles.brandLine}>{vm.businessLine}</Text> : null}
            {vm.businessAddress ? <Text style={styles.brandMeta}>{vm.businessAddress}</Text> : null}
            {(vm.businessPhone || vm.businessEmail || vm.businessWebsite) && (
              <Text style={styles.brandMeta}>
                {[vm.businessPhone, vm.businessEmail, vm.businessWebsite]
                  .filter(Boolean)
                  .join("  ·  ")}
              </Text>
            )}
          </View>
          <View>
            <Text style={[styles.wordmark, { color: accent }]}>{vm.invoiceTitle}</Text>
            <Text style={styles.invoiceNo}>
              {vm.status === "issued" ? vm.number : "Draft"}
            </Text>
            <View style={[styles.statusBadge, { color: status.color === colors.accent ? accent : status.color, backgroundColor: status.bg, border: vm.effectiveStatus === "draft" ? 1 : undefined, borderColor: vm.effectiveStatus === "draft" ? colors.line : undefined }]}>
              <Text>{status.text}</Text>
            </View>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.col}>
            <Text style={styles.metaTitle}>Ditagihkan ke</Text>
            <Text style={styles.clientName}>{vm.clientName}</Text>
            {vm.clientEmail ? <Text style={styles.clientLine}>{vm.clientEmail}</Text> : null}
            {vm.clientAddress ? <Text style={styles.clientLine}>{vm.clientAddress}</Text> : null}
          </View>
          <View style={spacer(48)} />
          <View style={styles.col}>
            <Text style={styles.metaTitle}>Detail</Text>
            <View style={styles.metaItem}>
              <Text style={styles.metaKey}>Tanggal terbit</Text>
              <Text style={styles.metaValue}>{formatDate(vm.issueDate)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaKey}>Jatuh tempo</Text>
              <Text style={styles.metaValue}>{formatDate(vm.dueDate)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.itemsTable}>
          <View style={styles.itemHeader}>
            <Text style={styles.cellNo}>#</Text>
            <Text style={styles.cellDesc}>Deskripsi</Text>
            <Text style={styles.cellQty}>Jumlah</Text>
            <Text style={styles.cellPrice}>Harga satuan</Text>
            <Text style={styles.cellSub}>Subtotal</Text>
          </View>
          {vm.items.map((it, i) => (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.cellNo}>{i + 1}</Text>
              <View style={styles.cellDesc}>
                <Text style={styles.cellDescTitle}>{it.description}</Text>
              </View>
              <Text style={styles.cellQty}>{it.quantity}</Text>
              <Text style={styles.cellPrice}>{formatRupiah(it.unitPriceSen)}</Text>
              <Text style={styles.cellSub}>{formatRupiah(it.subtotalSen)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{formatRupiah(vm.subtotalSen)}</Text>
          </View>
          {vm.taxSen > 0 ? (
            <View style={styles.totalRow}>
              <Text>{vm.taxLabel}</Text>
              <Text>{formatRupiah(vm.taxSen)}</Text>
            </View>
          ) : null}
          {vm.hasAdjustment ? (
            <View style={vm.adjustmentSen < 0 ? styles.totalRowNegative : styles.totalRow}>
              <Text>Penyesuaian</Text>
              <Text>
                {vm.adjustmentSen < 0 ? "−" : "+"}{" "}
                {formatRupiah(Math.abs(vm.adjustmentSen))}
              </Text>
            </View>
          ) : null}
          {vm.paidSen > 0 ? (
            <View style={styles.totalRow}>
              <Text>Pembayaran</Text>
              <Text>− {formatRupiah(vm.paidSen)}</Text>
            </View>
          ) : null}
          <View style={styles.totalRowStrong}>
            <Text>Sisa tagihan</Text>
            <Text>{formatRupiah(Math.max(0, vm.balanceSen))}</Text>
          </View>
        </View>

        {vm.paymentTo ? (
          <View style={styles.sections}>
            <Text style={styles.sectionTitle}>Pembayaran ke</Text>
            <Text>{vm.paymentTo}</Text>
          </View>
        ) : null}

        {vm.paymentTerms ? (
          <View style={styles.sections}>
            <Text style={styles.sectionTitle}>Ketentuan</Text>
            <Text>{vm.paymentTerms}</Text>
          </View>
        ) : null}

        {vm.signatureImageDataUri || vm.signatureText ? (
          <View style={styles.signature}>
            <Text>{vm.businessName || vm.invoiceTitle}</Text>
            {vm.signatureImageDataUri ? (
              // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt prop
              <Image src={vm.signatureImageDataUri} style={styles.signatureImage} />
            ) : null}
            {vm.signatureText ? (
              <Text
                style={[
                  styles.signatureName,
                  vm.signatureImageDataUri ? { marginTop: 4 } : undefined,
                ]}
              >
                {vm.signatureText}
              </Text>
            ) : null}
          </View>
        ) : null}

        {vm.footerNote ? (
          <View style={styles.footer}>
            <Text>{vm.footerNote}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );

  const buffer = await renderToBuffer(doc);
  const bytes = new Uint8Array(buffer);
  const ab = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(ab).set(bytes);
  return ab;
}