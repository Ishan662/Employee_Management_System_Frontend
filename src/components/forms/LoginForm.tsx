"use client";

import React from "react";
import { Form, Input, Button, Card, message } from "antd";
import { login } from "@/lib/auth";
import Link from "next/link";

export default function LoginForm() {
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      await login(values.email, values.password);
      message.success("Login successful");
      window.location.href = "/dashboard";
    } catch {
      message.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item label="Email" name="email" rules={[{ required: true }]}>
          <Input placeholder="Enter your email" />
        </Form.Item>

        <Form.Item label="Password" name="password" rules={[{ required: true }]}>
          <Input.Password placeholder="Enter your password" />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          className="w-full mt-2"
        >
          Login
        </Button>

        <div className="text-center mt-4">
        <span className="text-gray-600">Don't have an account? </span>
        <Link href="/signup" className="text-blue-600 hover:text-blue-800 font-medium">
          Sign up
        </Link>
      </div>
      </Form>

      
    </Card>
  );
}