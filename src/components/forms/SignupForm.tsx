"use client";

import { Form, Input, Button, Card, message } from "antd";
import { signup } from "@/lib/auth";
import { useState } from "react";
import Link from "next/link";

export default function SignupForm() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      if (values.password !== values.confirmPassword) {
        message.error("Passwords do not match");
        return;
      }
      setLoading(true);
      await signup({
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        password: values.password,
      });
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
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, type: "email", message: "Valid email required" }]}
        >
          <Input placeholder="Enter your email" />
        </Form.Item>

        <Form.Item
          label="First Name"
          name="firstName"
          rules={[{ required: true, message: "First name is required" }]}
        >
          <Input placeholder="Enter your first name" />
        </Form.Item>

        <Form.Item label="Last Name" name="lastName">
          <Input placeholder="Enter your last name" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: "Password is required" },
            { min: 8, message: "Password must be at least 8 characters" },
          ]}
        >
          <Input.Password placeholder="Enter your password" />
        </Form.Item>

        <Form.Item
          label="Confirm Password"
          name="confirmPassword"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Please confirm your password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match"));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Re-enter your password" />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          className="w-full mt-2"
        >
          Sign Up
        </Button>

        <div className="text-center mt-4">
          <span className="text-gray-600">Already have an account? </span>
            <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Log in
            </Link>
        </div>
      </Form>
    </Card>
  );
}
