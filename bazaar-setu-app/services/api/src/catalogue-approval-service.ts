import { catalogueImagePath } from "./catalogue-images.js";
import { prisma } from "./db.js";

function productIdFromName(name: string, fallbackId: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `product-${fallbackId.slice(0, 8)}`;
}

export async function approveProductRequest(requestId: string, reason?: string) {
  return prisma.$transaction(async (tx) => {
    const request = await tx.productApprovalRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED", reason: reason?.trim() || undefined }
    });

    const productId = productIdFromName(request.name, request.id);
    const imageUrl = request.imageUrl?.startsWith("demo://") || !request.imageUrl
      ? catalogueImagePath("products", productId)
      : request.imageUrl;

    const product = await tx.productMaster.upsert({
      where: { id: productId },
      update: {
        active: true,
        categoryId: request.categoryId,
        name: request.name,
        unit: request.unit,
        hsn: request.hsn,
        imageUrl
      },
      create: {
        id: productId,
        categoryId: request.categoryId,
        name: request.name,
        unit: request.unit,
        hsn: request.hsn,
        imageUrl,
        aliases: [request.name.toLowerCase()],
        fssaiApplicable: true,
        legalMetrology: {
          netQuantity: request.unit,
          countryOfOrigin: "India",
          consumerCare: "Bazaar Setu Support"
        }
      }
    });

    const updatedRequest = await tx.productApprovalRequest.update({
      where: { id: request.id },
      data: { productId: product.id }
    });

    await tx.notification.create({
      data: {
        audience: "seller",
        type: "approval",
        title: "Product request approved",
        body: `${request.name} is now available in the Bazaar Setu master catalogue.`
      }
    });

    return updatedRequest;
  });
}

export async function rejectProductRequest(requestId: string, reason: string) {
  const request = await prisma.productApprovalRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED", reason }
  });

  await prisma.notification.create({
    data: {
      audience: "seller",
      type: "approval",
      title: "Product request rejected",
      body: reason || `${request.name} needs more information before it can be approved.`
    }
  });

  return request;
}
