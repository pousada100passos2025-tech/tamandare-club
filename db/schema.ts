import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const partners = sqliteTable("partners", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  businessName: text("business_name").notNull(),
  email: text("email").notNull(),
  whatsapp: text("whatsapp"),
  serviceType: text("service_type").notNull(),
  instagram: text("instagram"),
  shareCode: text("share_code").notNull().unique(),
  createdAt: text("created_at").notNull(),
});

export const attendees = sqliteTable("attendees", {
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull(),
  cpf: text("cpf").notNull(),
  email: text("email").notNull(),
  eventType: text("event_type").notNull(),
  guestCount: integer("guest_count").notNull(),
  eventLocation: text("event_location").notNull(),
  eventDate: text("event_date").notNull(),
  requestedService: text("requested_service").notNull(),
  partnerCode: text("partner_code"),
  accessCode: text("access_code").notNull().unique(),
  consentAt: text("consent_at").notNull(),
  checkedInAt: text("checked_in_at"),
  createdAt: text("created_at").notNull(),
}, (table) => [index("idx_attendees_partner_code").on(table.partnerCode)]);
