"use client";

import { Form, Input, Button, Card, message } from "antd";
import { signup } from "@/lib/auth";
import { useState } from "react";

export default function SignupForm() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      await signup(values);
      message.success("Signup successful");
      window.location.href = "/dashboard";
    } catch {
      message.error("Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Sign Up</h1>
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
          Sign Up
        </Button>
      </Form>
    </Card>
  );
}
