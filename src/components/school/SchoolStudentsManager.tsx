import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Upload, Download, Trash2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  schoolId: string;
  schoolCode: string;
  remainingSlots: number;
  onStudentsUpdate: () => void;
}

export default function SchoolStudentsManager({ schoolId, schoolCode, remainingSlots, onStudentsUpdate }: Props) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    fullName: "",
    classLevel: "",
  });

  useEffect(() => {
    fetchStudents();
  }, [schoolId]);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("school_students")
        .select("*, users(email)")
        .eq("school_id", schoolId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error: any) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    }
  };

  const generateCredentials = (fullName: string) => {
    const cleanName = fullName.toLowerCase().replace(/\s+/g, "");
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const username = `${cleanName}${randomNum}`;
    const password = `edura${randomNum}`;
    return { username, password };
  };

  const handleAddStudent = async () => {
    if (!newStudent.fullName.trim()) {
      toast.error("Please enter student's full name");
      return;
    }

    if (remainingSlots <= 0) {
      toast.error("No remaining student slots. Please upgrade your subscription.");
      return;
    }

    setLoading(true);
    try {
      // Call Edge Function to create student
      const { data, error } = await supabase.functions.invoke('create-school-student', {
        body: {
          schoolCode,
          fullName: newStudent.fullName,
          classLevel: newStudent.classLevel || null,
        }
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      const { email, password } = data.credentials;

      // Show credentials in a custom dialog
      toast.success(
        <div className="space-y-2">
          <p className="font-semibold">Student added successfully!</p>
          <div className="space-y-1 text-sm">
            <p><strong>Email:</strong> {email}</p>
            <p><strong>Password:</strong> {password}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Share these credentials with the student. They'll use the email to login.
          </p>
        </div>,
        {
          duration: 10000,
        }
      );
      setIsAddModalOpen(false);
      setNewStudent({ fullName: "", classLevel: "" });
      fetchStudents();
      onStudentsUpdate();
    } catch (error: any) {
      console.error("Error adding student:", error);
      toast.error(error.message || "Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: string, userId: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
      // Delete student record
      const { error: deleteError } = await supabase
        .from("school_students")
        .delete()
        .eq("id", studentId);

      if (deleteError) throw deleteError;

      // Decrement students count
      const { error: updateError } = await supabase.rpc("decrement_students_added", {
        school_id_param: schoolId
      });

      if (updateError) console.error("Error updating count:", updateError);

      toast.success("Student deleted successfully");
      fetchStudents();
      onStudentsUpdate();
    } catch (error: any) {
      console.error("Error deleting student:", error);
      toast.error("Failed to delete student");
    }
  };

  const exportCredentials = () => {
    const csv = [
      ["Full Name", "Email", "Password", "Class Level"],
      ...students.map(s => [
        s.full_name, 
        `${s.student_username}@${schoolCode}.edu.ng`,
        s.student_password_hash, 
        s.class_level || ""
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_credentials.csv";
    a.click();
    toast.success("Credentials exported successfully");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Students Management</CardTitle>
            <CardDescription>
              Manage your school's students. Remaining slots: {remainingSlots}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button disabled={remainingSlots <= 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Student</DialogTitle>
                  <DialogDescription>
                    Enter student details. Login credentials will be auto-generated.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={newStudent.fullName}
                      onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })}
                      placeholder="e.g., John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="classLevel">Class Level</Label>
                    <Input
                      id="classLevel"
                      value={newStudent.classLevel}
                      onChange={(e) => setNewStudent({ ...newStudent, classLevel: e.target.value })}
                      placeholder="e.g., SS3"
                    />
                  </div>
                  <Button onClick={handleAddStudent} disabled={loading} className="w-full">
                    {loading ? "Adding..." : "Add Student"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={exportCredentials} disabled={students.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export Credentials
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No students added yet</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Student Email</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.full_name}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {student.student_username}@{schoolCode}.edu.ng
                  </TableCell>
                  <TableCell className="font-mono">{student.student_password_hash}</TableCell>
                  <TableCell>{student.class_level || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={student.is_active ? "default" : "secondary"}>
                      {student.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteStudent(student.id, student.user_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}