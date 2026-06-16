import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import api from "@/api/axios";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { isValidEmailAddress } from "@/utils/validation";

interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterProps {
  handleActivePageChange: (page: "login" | "register") => void;
}

function Register({ handleActivePageChange }: RegisterProps) {
  const [isError, setIsError] = useState<string[]>([]);
  const route = useNavigate();

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      const result = await api.post("/api/auth/register", credentials);
      return result.data;
    },
    onSuccess: (result) => {
      setIsError([]);
      localStorage.setItem("email", JSON.stringify(result.email));
      toast.success("Account created successfully!");
      route(`/verification?userId=${result.publicId}`);
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.errors?.[0] || "Registration failed";
        setIsError([message]);
        toast.error(message);
        return;
      }

      setIsError(["Registration failed"]);
      toast.error("Registration failed!");
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsError([]);

    const fd = new FormData(e.currentTarget);
    const firstName = fd.get("firstName");
    const lastName = fd.get("lastName");
    const email = fd.get("email");
    const password = fd.get("password");
    const confirmPassword = fd.get("confirmPassword");

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setIsError(["Please fill in all fields"]);
      return;
    }

    if (!isValidEmailAddress(String(email))) {
      setIsError(["Invalid email format"]);
      return;
    }

    if (String(password) !== String(confirmPassword)) {
      setIsError(["Passwords do not match"]);
      return;
    }

    registerMutation.mutate({
      firstName: String(firstName),
      lastName: String(lastName),
      email: String(email),
      password: String(password),
      confirmPassword: String(confirmPassword),
    });
  };

  return (
    <div>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => handleSubmit(e)}>
            <FieldGroup>
              <Field>
                <Field>
                  <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder=""
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="John Doe"
                    required
                  />
                </Field>
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirmPassword">
                      Confirm Password
                    </FieldLabel>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                    />
                  </Field>
                </Field>
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>
              {isError.length > 0 && (
                <div className="mb-1 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      {isError.map((error, i) => (
                        <p key={i} className="font-medium">
                          {error}
                        </p>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsError([])}
                      className="ml-2 text-destructive hover:opacity-70"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
              <Field>
                <Button type="submit" disabled={registerMutation.isPending}>
                  {registerMutation.isPending
                    ? "Creating account..."
                    : "Create Account"}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleActivePageChange("login");
                    }}
                  >
                    Sign in
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}

export default Register;
