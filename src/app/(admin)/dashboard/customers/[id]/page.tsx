import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CustomerProfileClient from "./CustomerProfileClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: {
        include: {
          items: {
            include: {
              product: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const customer = {
    id: user.id,
    name: user.name,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role,
    loyaltyPoints: user.loyaltyPoints ?? 0,
    createdAt: user.createdAt,
    orders: user.orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      items: order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        product: item.product ? { title: item.product.title } : null,
      })),
    })),
  };

  return <CustomerProfileClient customer={customer} />;
}
