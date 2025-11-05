// Fix existing image URLs: http -> https for api.roomfinder237.com
// Usage:
//   DRY_RUN=true node scripts/fix-image-urls.js
//   node scripts/fix-image-urls.js

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const OLD_PREFIX = "http://api.roomfinder237.com";
const NEW_PREFIX = "https://api.roomfinder237.com";
const DRY_RUN = process.env.DRY_RUN === "true";

function replaceIfStartsWith(url) {
  if (!url || typeof url !== "string") return url;
  return url.startsWith(OLD_PREFIX)
    ? NEW_PREFIX + url.slice(OLD_PREFIX.length)
    : url;
}

function arrayReplace(urls) {
  if (!Array.isArray(urls)) return urls;
  return urls.map(replaceIfStartsWith);
}

async function updateUsers() {
  const users = await prisma.user.findMany({
    where: { avatar: { startsWith: OLD_PREFIX } },
    select: { id: true, avatar: true },
  });
  let updated = 0;
  for (const u of users) {
    const avatar = replaceIfStartsWith(u.avatar);
    if (!DRY_RUN) {
      await prisma.user.update({ where: { id: u.id }, data: { avatar } });
    }
    updated++;
  }
  return { scanned: users.length, updated };
}

async function updateProperties() {
  const props = await prisma.property.findMany({
    where: { images: { hasSome: [OLD_PREFIX] } },
    select: { id: true, images: true },
  });
  // Note: hasSome with full OLD_PREFIX won't match unless array element equals it exactly.
  // So we fetch all and filter manually when needed.
  const allProps = await prisma.property.findMany({
    select: { id: true, images: true },
  });
  let updated = 0,
    scanned = allProps.length;
  for (const p of allProps) {
    if (!Array.isArray(p.images) || p.images.length === 0) continue;
    const newImages = arrayReplace(p.images);
    const changed = JSON.stringify(newImages) !== JSON.stringify(p.images);
    if (changed) {
      if (!DRY_RUN) {
        await prisma.property.update({
          where: { id: p.id },
          data: { images: newImages },
        });
      }
      updated++;
    }
  }
  return { scanned, updated };
}

async function updateBlogs() {
  const blogs = await prisma.blog.findMany({
    select: { id: true, featuredImage: true },
  });
  let updated = 0,
    scanned = blogs.length;
  for (const b of blogs) {
    const newImg = replaceIfStartsWith(b.featuredImage);
    if (newImg !== b.featuredImage) {
      if (!DRY_RUN) {
        await prisma.blog.update({
          where: { id: b.id },
          data: { featuredImage: newImg },
        });
      }
      updated++;
    }
  }
  return { scanned, updated };
}

async function updateHostVerifications() {
  const verifs = await prisma.hostVerification.findMany({
    select: {
      id: true,
      idFrontImage: true,
      idBackImage: true,
      selfieImage: true,
      ownershipDocuments: true,
    },
  });
  let updated = 0,
    scanned = verifs.length;
  for (const v of verifs) {
    const data = {};
    const newFront = replaceIfStartsWith(v.idFrontImage);
    if (newFront !== v.idFrontImage) data.idFrontImage = newFront;
    const newBack = replaceIfStartsWith(v.idBackImage);
    if (newBack !== v.idBackImage) data.idBackImage = newBack;
    const newSelfie = replaceIfStartsWith(v.selfieImage);
    if (newSelfie !== v.selfieImage) data.selfieImage = newSelfie;
    const newDocs = arrayReplace(v.ownershipDocuments);
    if (JSON.stringify(newDocs) !== JSON.stringify(v.ownershipDocuments))
      data.ownershipDocuments = newDocs;
    if (Object.keys(data).length > 0) {
      if (!DRY_RUN) {
        await prisma.hostVerification.update({ where: { id: v.id }, data });
      }
      updated++;
    }
  }
  return { scanned, updated };
}

async function updateSupport() {
  const tickets = await prisma.customerSupport.findMany({
    select: { id: true, attachments: true },
  });
  let tUpdated = 0,
    tScanned = tickets.length;
  for (const t of tickets) {
    const newAtt = arrayReplace(t.attachments);
    if (JSON.stringify(newAtt) !== JSON.stringify(t.attachments)) {
      if (!DRY_RUN) {
        await prisma.customerSupport.update({
          where: { id: t.id },
          data: { attachments: newAtt },
        });
      }
      tUpdated++;
    }
  }
  const messages = await prisma.supportMessage.findMany({
    select: { id: true, attachments: true },
  });
  let mUpdated = 0,
    mScanned = messages.length;
  for (const m of messages) {
    const newAtt = arrayReplace(m.attachments);
    if (JSON.stringify(newAtt) !== JSON.stringify(m.attachments)) {
      if (!DRY_RUN) {
        await prisma.supportMessage.update({
          where: { id: m.id },
          data: { attachments: newAtt },
        });
      }
      mUpdated++;
    }
  }
  return { scanned: tScanned + mScanned, updated: tUpdated + mUpdated };
}

async function main() {
  console.log(`Starting URL fix (DRY_RUN=${DRY_RUN}) ...`);
  const results = [];
  results.push(["users.avatar", await updateUsers()]);
  results.push(["properties.images", await updateProperties()]);
  results.push(["blogs.featuredImage", await updateBlogs()]);
  results.push([
    "host_verifications.(images/docs)",
    await updateHostVerifications(),
  ]);
  results.push(["support.(attachments)", await updateSupport()]);
  console.log("Summary:");
  for (const [label, r] of results) {
    console.log(`${label}: scanned=${r.scanned} updated=${r.updated}`);
  }
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
