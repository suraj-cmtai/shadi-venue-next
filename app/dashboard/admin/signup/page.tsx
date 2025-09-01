"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/redux/store";
import { signup, fetchAuthList, updateAuthStatus, updateAuth, deleteAuth } from "@/lib/redux/features/authSlice";
import { Mail, Lock, Eye, EyeOff, Loader2, User, AlertCircle, Search, MoreHorizontal, CheckCircle, XCircle, Trash2, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "hotel", label: "Hotel Manager" },
  { value: "vendor", label: "Vendor" },
  { value: "user", label: "User" },
  { value: "blog", label: "Blog" },
  { value: "marketing", label: "Marketing" },
];

const AdminSignupPage = () => {
  // Form State
  const [name, setName] = useState("");
  const [role, setRole] = useState(ROLES[0].value);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Role-specific description messages
  const getRoleDescription = (role: string) => {
    switch (role) {
      case "admin":
        return "Create a new administrator account with full system access";
      case "hotel":
        return "Add a new hotel manager to manage venue listings";
      case "vendor":
        return "Register a new vendor for wedding services";
      case "user":
        return "Create a new user account for wedding planning";
      case "blog":
        return "Add a new blog manager to create and manage content";
      case "marketing":
        return "Register a marketing team member to manage inquiries and promotions";
      default:
        return "Create a new account";
    }
  };
  
  // Table State
  const [searchQuery, setSearchQuery] = useState("");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedAuthId, setSelectedAuthId] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<"activate" | "deactivate" | "delete" | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  
  // Edit State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { authList, listLoading } = useSelector((state: RootState) => state.auth);

  // Fetch auth list on mount
  useEffect(() => {
    dispatch(fetchAuthList());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await dispatch(signup({ name, email, password, role })).unwrap();
      toast.success("Account created successfully!");
      
      // Send welcome email
      try {
        await fetch("/api/routes/welcome", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, role, password }),
        });
      } catch (welcomeError) {
        // Log error but don't block the signup process
        console.error("Welcome email error:", welcomeError);
      }

      dispatch(fetchAuthList()); // Refresh the list
      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setRole(ROLES[0].value);
    } catch (error: unknown) {
      let errorMessage = "Signup failed. Please try again.";
      if (error && typeof error === "object" && "message" in error) {
        errorMessage = (error as { message: string }).message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, currentStatus: string) => {
    setSelectedAuthId(id);
    setSelectedAction(currentStatus === "active" ? "deactivate" : "activate");
    setIsConfirmDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    setSelectedAuthId(id);
    setSelectedAction("delete");
    setIsConfirmDialogOpen(true);
  };

  const handleEdit = (auth: any) => {
    setSelectedAuthId(auth.id);
    setEditName(auth.name);
    setEditEmail(auth.email);
    setEditRole(auth.role);
    setIsEditDialogOpen(true);
  };

  const handleUpdateAuth = async () => {
    if (!selectedAuthId) return;
    
    setEditLoading(true);
    try {
      await dispatch(updateAuth({
        id: selectedAuthId,
        name: editName,
        email: editEmail,
        role: editRole
      })).unwrap();
      toast.success("Auth entry updated successfully");
      setIsEditDialogOpen(false);
      setSelectedAuthId(null);
      setEditName("");
      setEditEmail("");
      setEditRole("");
    } catch (error: any) {
      toast.error(error.message || "Update failed");
    } finally {
      setEditLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedAuthId || !selectedAction) return;

    try {
      if (selectedAction === "delete") {
        await dispatch(deleteAuth(selectedAuthId)).unwrap();
        toast.success("Auth entry deleted successfully");
      } else {
        const newStatus = selectedAction === "activate" ? "active" : "inactive";
        await dispatch(updateAuthStatus({ id: selectedAuthId, status: newStatus })).unwrap();
        toast.success(`Auth status updated to ${newStatus}`);
      }
    } catch (error: any) {
      toast.error(error.message || "Action failed");
    } finally {
      setIsConfirmDialogOpen(false);
      setSelectedAuthId(null);
      setSelectedAction(null);
    }
  };

  const filteredAuthList = authList.filter(auth => {
    // First apply role filter
    if (selectedRole && auth.role !== selectedRole) {
      return false;
    }
    
    // Then apply search filter
    const searchLower = searchQuery.toLowerCase();
    return (
      auth.email.toLowerCase().includes(searchLower) ||
      auth.name.toLowerCase().includes(searchLower) ||
      auth.role.toLowerCase().includes(searchLower)
    );
  });

  const getStatusStyles = (status: string) => {
    return status === "active"
      ? "text-green-700 bg-green-50"
      : "text-red-700 bg-red-50";
  };

  return (
    <div className="min-h-[90vh] p-6 space-y-8">
      {/* Create New Auth Form */}
      <div className="max-w-md mx-auto bg-white/95 p-6 rounded-lg shadow-sm border border-pink-200/50">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-pink-700">Create New Account</h2>
          <p className="text-gray-600 mt-2">{getRoleDescription(role)}</p>
        </div>
        
        {error && (
          <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-navy">Full Name</label>
            <div className="relative">
              <Input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jane Admin"
                className="pl-10 border-gray-300"
                required
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-navy">Role</label>
            <div className="relative">
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-full pl-10">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <User className="w-4 h-4 text-gray-400" />
                </span>
                <SelectContent>
                  {ROLES.map(r => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-navy">Email</label>
            <div className="relative">
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@email.com"
                className="pl-10 border-gray-300"
                required
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-navy">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="pl-10 pr-10 border-gray-300"
                required
                minLength={6}
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowPassword(v => !v)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </div>

      {/* Auth List Table */}
      <div className="bg-white/95 rounded-lg shadow-sm p-6 border border-pink-200/50">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-pink-700">Auth Management</h2>
            <div className="relative w-64">
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
          
          {/* Role Tabs */}
          <div className="flex space-x-2 border-b">
            <Button
              variant="ghost"
              className={`rounded-none border-b-2 ${
                !selectedRole ? 'border-pink-500 text-pink-700' : 'border-transparent'
              }`}
              onClick={() => setSelectedRole(null)}
            >
              All
            </Button>
            {ROLES.map((r) => (
              <Button
                key={r.value}
                variant="ghost"
                className={`rounded-none border-b-2 ${
                  selectedRole === r.value ? 'border-pink-500 text-pink-700' : 'border-transparent hover:text-pink-600'
                }`}
                onClick={() => setSelectedRole(r.value)}
              >
                {r.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredAuthList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No auth entries found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAuthList.map((auth) => (
                  <TableRow key={auth.id}>
                    <TableCell>{auth.name}</TableCell>
                    <TableCell>{auth.email}</TableCell>
                    <TableCell className="capitalize">{auth.role}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusStyles(auth.status)}`}>
                        {auth.status}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(auth.createdOn).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleEdit(auth)}
                            className="text-blue-600"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(auth.id, auth.status)}
                            className={auth.status === "active" ? "text-red-600" : "text-green-600"}
                          >
                            {auth.status === "active" ? (
                              <>
                                <XCircle className="w-4 h-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(auth.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              {selectedAction === "delete"
                ? "Are you sure you want to delete this auth entry? This action cannot be undone."
                : selectedAction === "activate"
                ? "Are you sure you want to activate this auth entry?"
                : "Are you sure you want to deactivate this auth entry?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant={selectedAction === "delete" ? "destructive" : "default"}
              onClick={handleConfirmAction}
            >
              {selectedAction === "delete" ? "Delete" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Auth Entry</DialogTitle>
            <DialogDescription>
              Update the details for this auth entry.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-navy">Full Name</label>
              <div className="relative">
                <Input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="Full Name"
                  className="pl-10 border-gray-300"
                  required
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-navy">Email</label>
              <div className="relative">
                <Input
                  type="email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  placeholder="Email"
                  className="pl-10 border-gray-300"
                  required
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-navy">Role</label>
              <div className="relative">
                <Select value={editRole} onValueChange={setEditRole}>
                  <SelectTrigger className="w-full pl-10">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <User className="w-4 h-4 text-gray-400" />
                  </span>
                  <SelectContent>
                    {ROLES.map(r => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={editLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateAuth}
              disabled={editLoading || !editName || !editEmail || !editRole}
            >
              {editLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSignupPage;
