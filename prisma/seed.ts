import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const COMPETITIONS = [
  { id: "brasileirao", label: "Brasileirão" },
  { id: "selecoes", label: "Seleções" },
  { id: "premier-league", label: "Premier League" },
  { id: "la-liga", label: "La Liga" },
  { id: "bundesliga", label: "Bundesliga" },
  { id: "serie-a", label: "Serie A" },
  { id: "ligue-1", label: "Ligue 1" },
];

// Same catalog as the design prototype's lib/products.js, plus the stock
// patterns lib/admin-store.js seeded per-index in the prototype.
const STOCK_PATTERNS = [
  { P: 14, M: 20, G: 18, GG: 9, XG: 3 },
  { P: 2, M: 6, G: 4, GG: 1, XG: 0 },
  { P: 10, M: 12, G: 15, GG: 8, XG: 5 },
  { P: 6, M: 3, G: 2, GG: 4, XG: 1 },
];

const PRODUCTS = [
  { slug: "flamengo-home-26", name: "Flamengo Home 2026", team: "Flamengo", competitionId: "brasileirao", price: 279.9, salePrice: 229.9, imageAltText: "Flamengo camisa I 2026" },
  { slug: "palmeiras-home-26", name: "Palmeiras Home 2026", team: "Palmeiras", competitionId: "brasileirao", price: 279.9, salePrice: null, imageAltText: "Palmeiras camisa I 2026" },
  { slug: "brasil-home-26", name: "Seleção Brasileira Home 2026", team: "Brasil", competitionId: "selecoes", price: 299.9, salePrice: 249.9, imageAltText: "Seleção Brasileira camisa I 2026" },
  { slug: "argentina-home-26", name: "Seleção Argentina Home 2026", team: "Argentina", competitionId: "selecoes", price: 299.9, salePrice: null, imageAltText: "Seleção Argentina camisa I 2026" },
  { slug: "arsenal-home-2526", name: "Arsenal Home 2025/26", team: "Arsenal", competitionId: "premier-league", price: 289.9, salePrice: null, imageAltText: "Arsenal camisa I 25/26" },
  { slug: "liverpool-home-2526", name: "Liverpool Home 2025/26", team: "Liverpool", competitionId: "premier-league", price: 289.9, salePrice: 239.9, imageAltText: "Liverpool camisa I 25/26" },
  { slug: "real-madrid-home-2526", name: "Real Madrid Home 2025/26", team: "Real Madrid", competitionId: "la-liga", price: 299.9, salePrice: null, imageAltText: "Real Madrid camisa I 25/26" },
  { slug: "barcelona-home-2526", name: "Barcelona Home 2025/26", team: "Barcelona", competitionId: "la-liga", price: 299.9, salePrice: 259.9, imageAltText: "Barcelona camisa I 25/26" },
  { slug: "bayern-home-2526", name: "Bayern de Munique Home 2025/26", team: "Bayern de Munique", competitionId: "bundesliga", price: 279.9, salePrice: null, imageAltText: "Bayern de Munique camisa I 25/26" },
  { slug: "dortmund-home-2526", name: "Borussia Dortmund Home 2025/26", team: "Borussia Dortmund", competitionId: "bundesliga", price: 279.9, salePrice: null, imageAltText: "Borussia Dortmund camisa I 25/26" },
  { slug: "inter-milao-home-2526", name: "Inter de Milão Home 2025/26", team: "Inter de Milão", competitionId: "serie-a", price: 279.9, salePrice: 229.9, imageAltText: "Inter de Milão camisa I 25/26" },
  { slug: "juventus-home-2526", name: "Juventus Home 2025/26", team: "Juventus", competitionId: "serie-a", price: 279.9, salePrice: null, imageAltText: "Juventus camisa I 25/26" },
  { slug: "psg-home-2526", name: "PSG Home 2025/26", team: "Paris Saint-Germain", competitionId: "ligue-1", price: 289.9, salePrice: null, imageAltText: "PSG camisa I 25/26" },
  { slug: "marseille-home-2526", name: "Olympique de Marselha Home 2025/26", team: "Olympique de Marselha", competitionId: "ligue-1", price: 289.9, salePrice: null, imageAltText: "Marselha camisa I 25/26" },
];

const COUPONS = [
  { code: "RP10", type: "percentage" as const, value: 10, expiresAt: new Date("2026-12-31"), usageLimit: 500, usedCount: 132 },
  { code: "BEMVINDO20", type: "fixed" as const, value: 20, expiresAt: new Date("2026-09-30"), usageLimit: 200, usedCount: 47 },
];

async function main() {
  for (const c of COMPETITIONS) {
    await prisma.competition.upsert({ where: { id: c.id }, update: { label: c.label }, create: c });
  }

  for (const [i, p] of PRODUCTS.entries()) {
    const stock = STOCK_PATTERNS[i % STOCK_PATTERNS.length];
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        name: p.name,
        team: p.team,
        competitionId: p.competitionId,
        price: p.price,
        salePrice: p.salePrice,
        imageAltText: p.imageAltText,
        active: true,
        stockP: stock.P,
        stockM: stock.M,
        stockG: stock.G,
        stockGG: stock.GG,
        stockXG: stock.XG,
      },
    });
  }

  for (const c of COUPONS) {
    await prisma.coupon.upsert({ where: { code: c.code }, update: {}, create: c });
  }

  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, customizationFee: 25.0 },
  });

  // Founding general_admin accounts. Passwords come from env (never hardcode
  // real credentials in a seed file); both must be rotated on first login.
  const founders = [
    { name: "Gustavo", email: "gustavolrnzcontato@gmail.com", password: process.env.SEED_ADMIN_PASSWORD_1 || "ChangeMe123!" },
    { name: "RP10FUT", email: "rpfut010@gmail.com", password: process.env.SEED_ADMIN_PASSWORD_2 || "ChangeMe123!" },
  ];
  for (const f of founders) {
    const passwordHash = await bcrypt.hash(f.password, 12);
    await prisma.staffUser.upsert({
      where: { email: f.email },
      update: {},
      create: { name: f.name, email: f.email, passwordHash, role: "general_admin" },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
