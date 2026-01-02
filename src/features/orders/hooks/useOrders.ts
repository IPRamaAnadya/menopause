"use client";

import { useState, useEffect } from "react";
import { OrderStatus } from "@/generated/prisma";

export interface OrderItem {
  id: number;
  public_id: string;
  order_number: string;
  type: string;
  status: OrderStatus;
  gross_amount: number;
  currency: string;
  breakdown: {
    base: number;
    admin_fee?: number;
    tax?: number;
    discount?: number;
  };
  reference_type?: string;
  reference_id?: number;
  paid_at?: string;
  created_at: string;
  payments: Array<{
    id: number;
    provider: string;
    status: string;
    payment_method?: string;
  }>;
}

export function useOrders(params?: {
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append("status", params.status);
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.offset) queryParams.append("offset", params.offset.toString());

      const response = await fetch(`/api/member/orders?${queryParams.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || "Failed to fetch orders");
      }

      setOrders(data.data.orders || []);
      setTotal(data.data.total || 0);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.status, params?.limit, params?.offset]);

  return {
    orders,
    total,
    loading,
    error,
    refetch: fetchOrders,
  };
}

export function useOrderDetail(publicId: string) {
  const [order, setOrder] = useState<OrderItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    if (!publicId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/member/orders/${publicId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Order not found");
        }
        throw new Error("Failed to fetch order");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || "Failed to fetch order");
      }

      setOrder(data.data || null);
    } catch (err) {
      console.error("Error fetching order detail:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [publicId]);

  return {
    order,
    loading,
    error,
    refetch: fetchOrder,
  };
}
