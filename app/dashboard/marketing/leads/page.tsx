"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch } from "@/lib/redux/store"
import {
  selectContacts,
  selectContactLoading,
  selectContactError,
  fetchContacts,
  createContact,
  updateContact,
  deleteContact,
  Contact
} from "@/lib/redux/features/contactSlice"
import { format } from "date-fns"
import { toast } from "sonner"
import { motion } from "framer-motion"
import {
  ChevronDown,
  MoreHorizontal,
  Plus,
  Pencil,
  Trash2,
  Search,
  Mail,
  Phone,
  Loader2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Add Textarea import
import { Textarea } from "@/components/ui/textarea"

export default function ContactPage() {
  const dispatch = useDispatch<AppDispatch>()
  const contacts = useSelector(selectContacts)
  const isLoading = useSelector(selectContactLoading)
  const error = useSelector(selectContactError)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newContact, setNewContact] = useState<{
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    preferredDate?: string;
    locationPreference?: string;
    venueServiceType?: string;
    guests?: number | string;
    budgetRange?: string;
    contactTimePreference?: string;
    status: 'New' | 'In Progress' | 'Completed';
    priority: 'Low' | 'Medium' | 'High';
  }>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    preferredDate: "",
    locationPreference: "",
    venueServiceType: "",
    guests: "",
    budgetRange: "",
    contactTimePreference: "",
    status: "New",
    priority: "Medium"
  })

  useEffect(() => {
    dispatch(fetchContacts())
  }, [dispatch])

  // Filter contacts based on search query and filters
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.subject.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || contact.status === statusFilter
    const matchesPriority = priorityFilter === "all" || contact.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  // Get color based on status
  const getStatusColor = (status: Contact['status']) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800"
      case "In Progress":
        return "bg-yellow-100 text-yellow-800"
      case "Completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Get color based on priority
  const getPriorityColor = (priority: Contact['priority']) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800"
      case "Medium":
        return "bg-orange-100 text-orange-800"
      case "Low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Handle adding new contact
  const handleAdd = async () => {
    const formData = new FormData()
    formData.append("name", newContact.name)
    formData.append("email", newContact.email)
    formData.append("phone", newContact.phone)
    formData.append("subject", newContact.subject)
    formData.append("additionalDetails", newContact.message)
    if (newContact.preferredDate) formData.append("preferredDate", newContact.preferredDate)
    if (newContact.locationPreference) formData.append("locationPreference", newContact.locationPreference)
    if (newContact.venueServiceType) formData.append("venueServiceType", newContact.venueServiceType)
    if (newContact.guests) formData.append("guests", String(newContact.guests))
    if (newContact.budgetRange) formData.append("budgetRange", newContact.budgetRange)
    if (newContact.contactTimePreference) formData.append("contactTimePreference", newContact.contactTimePreference)
    formData.append("status", newContact.status)
    formData.append("priority", newContact.priority)

    try {
      await dispatch(createContact(formData)).unwrap()
      setIsAddDialogOpen(false)
      setNewContact({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        preferredDate: "",
        locationPreference: "",
        venueServiceType: "",
        guests: "",
        budgetRange: "",
        contactTimePreference: "",
        status: "New",
        priority: "Medium"
      })
      toast.success("Contact added successfully!")
    } catch (error) {
      toast.error("Failed to add contact")
    }
  }

  // Handle updating contact
  const handleUpdate = async () => {
    if (!selectedContact) return

    const formData = new FormData()
    formData.append("name", selectedContact.name)
    formData.append("email", selectedContact.email)
    formData.append("phone", selectedContact.phone)
    formData.append("subject", selectedContact.subject)
    formData.append("additionalDetails", selectedContact.message)
    formData.append("status", selectedContact.status)
    formData.append("priority", selectedContact.priority)
    if (selectedContact.preferredDate) formData.append("preferredDate", selectedContact.preferredDate)
    if (selectedContact.locationPreference) formData.append("locationPreference", selectedContact.locationPreference)
    if (selectedContact.venueServiceType) formData.append("venueServiceType", selectedContact.venueServiceType)
    if (typeof selectedContact.guests !== 'undefined') formData.append("guests", String(selectedContact.guests))
    if (selectedContact.budgetRange) formData.append("budgetRange", selectedContact.budgetRange)
    if (selectedContact.contactTimePreference) formData.append("contactTimePreference", selectedContact.contactTimePreference)

    try {
      await dispatch(updateContact({ 
        id: selectedContact.id, 
        data: formData 
      })).unwrap()
      setIsEditDialogOpen(false)
      toast.success("Contact updated successfully!")
    } catch (error) {
      toast.error("Failed to update contact")
    }
  }

  // Handle deleting contact
  const handleDelete = async () => {
    if (!selectedContact) return

    try {
      await dispatch(deleteContact(selectedContact.id)).unwrap()
      setIsDeleteDialogOpen(false)
      toast.success("Contact deleted successfully!")
    } catch (error) {
      toast.error("Failed to delete contact")
    }
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Error: {error}</p>
        <Button 
          onClick={() => dispatch(fetchContacts())}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Contact
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="New">New</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <motion.div
        layout
        className="rounded-md border"
      >
        <Table className="overflow-y-scroll">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email / Phone</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Guests</TableHead>
              <TableHead>Preferred Date</TableHead>
              <TableHead>Location Preference</TableHead>
              <TableHead>Venue/Service Type</TableHead>
              <TableHead>Budget Range</TableHead>
              <TableHead>Contact Time Preference</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={15} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredContacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={15} className="text-center py-8">
                  No contacts found
                </TableCell>
              </TableRow>
            ) : (
              filteredContacts.map((contact) => (
                <motion.tr
                  key={contact.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  layout
                >
                  <TableCell>
                    <div className="font-medium">{contact.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        {contact.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        {contact.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{contact.subject}</TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate" title={contact.message}>
                      {contact.message}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(contact.status)}>
                      {contact.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(contact.priority)}>
                      {contact.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{typeof contact.guests !== 'undefined' ? contact.guests : '-'}</TableCell>
                  <TableCell>{contact.preferredDate || '-'}</TableCell>
                  <TableCell>{contact.locationPreference || '-'}</TableCell>
                  <TableCell>{contact.venueServiceType || '-'}</TableCell>
                  <TableCell>{contact.budgetRange || '-'}</TableCell>
                  <TableCell>{contact.contactTimePreference || '-'}</TableCell>
                  <TableCell>{contact.createdAt ? format(new Date(contact.createdAt), "MMM d, yyyy") : '-'}</TableCell>
                  <TableCell>{contact.updatedAt ? format(new Date(contact.updatedAt), "MMM d, yyyy") : '-'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedContact(contact)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelectedContact(contact)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem> */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Add Contact Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>
              Add a new contact to your list.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <form
              className="grid gap-4 py-4"
              onSubmit={e => {
                e.preventDefault()
                handleAdd()
              }}
            >
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  disabled
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  disabled
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  disabled
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={newContact.subject}
                  onChange={(e) => setNewContact({ ...newContact, subject: e.target.value })}
                  disabled
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={newContact.message}
                  onChange={(e) => setNewContact({ ...newContact, message: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="preferredDate">Preferred Date</Label>
                  <Input
                    id="preferredDate"
                    type="date"
                    value={newContact.preferredDate}
                    onChange={(e) => setNewContact({ ...newContact, preferredDate: e.target.value })}
                    disabled
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="guests">Guests</Label>
                  <Input
                    id="guests"
                    type="number"
                    value={newContact.guests as any}
                    onChange={(e) => setNewContact({ ...newContact, guests: e.target.value })}
                    disabled
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="locationPreference">Location Preference</Label>
                  <Input
                    id="locationPreference"
                    value={newContact.locationPreference}
                    onChange={(e) => setNewContact({ ...newContact, locationPreference: e.target.value })}
                    disabled
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="venueServiceType">Venue/Service Type</Label>
                  <Input
                    id="venueServiceType"
                    value={newContact.venueServiceType}
                    onChange={(e) => setNewContact({ ...newContact, venueServiceType: e.target.value })}
                    disabled
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="budgetRange">Budget Range</Label>
                  <Input
                    id="budgetRange"
                    value={newContact.budgetRange}
                    onChange={(e) => setNewContact({ ...newContact, budgetRange: e.target.value })}
                    disabled
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contactTimePreference">Contact Time Preference</Label>
                  <Input
                    id="contactTimePreference"
                    value={newContact.contactTimePreference}
                    onChange={(e) => setNewContact({ ...newContact, contactTimePreference: e.target.value })}
                    disabled
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newContact.status}
                    onValueChange={(value: Contact['status']) =>
                      setNewContact({ ...newContact, status: value })
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newContact.priority}
                    onValueChange={(value: Contact['priority']) =>
                      setNewContact({ ...newContact, priority: value })
                    }
                    disabled
                  >
                    <SelectTrigger id="priority" disabled>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Contact"}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Contact Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>
              Make changes to the contact information.
            </DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <div className="max-h-[70vh] overflow-y-auto">
              <form
                className="grid gap-4 py-4"
                onSubmit={e => {
                  e.preventDefault()
                  handleUpdate()
                }}
              >
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={selectedContact.name}
                    onChange={(e) =>
                      setSelectedContact({
                        ...selectedContact,
                        name: e.target.value,
                      })
                    }
                    disabled
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={selectedContact.email}
                    onChange={(e) =>
                      setSelectedContact({
                        ...selectedContact,
                        email: e.target.value,
                      })
                    }
                    disabled
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={selectedContact.phone}
                    onChange={(e) =>
                      setSelectedContact({
                        ...selectedContact,
                        phone: e.target.value,
                      })
                    }
                    disabled
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-subject">Subject</Label>
                  <Input
                    id="edit-subject"
                    value={selectedContact.subject}
                    onChange={(e) =>
                      setSelectedContact({
                        ...selectedContact,
                        subject: e.target.value,
                      })
                    }
                    disabled
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-message">Message</Label>
                  <Textarea
                    id="edit-message"
                    value={selectedContact.message}
                    onChange={(e) =>
                      setSelectedContact({
                        ...selectedContact,
                        message: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-preferredDate">Preferred Date</Label>
                    <Input
                      id="edit-preferredDate"
                      type="date"
                      value={selectedContact.preferredDate || ''}
                      onChange={(e) => setSelectedContact({ ...selectedContact, preferredDate: e.target.value })}
                      disabled
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-guests">Guests</Label>
                    <Input
                      id="edit-guests"
                      type="number"
                      value={typeof selectedContact.guests === 'undefined' ? '' : String(selectedContact.guests)}
                      onChange={(e) => setSelectedContact({ ...selectedContact, guests: Number(e.target.value) })}
                      disabled
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-locationPreference">Location Preference</Label>
                    <Input
                      id="edit-locationPreference"
                      value={selectedContact.locationPreference || ''}
                      onChange={(e) => setSelectedContact({ ...selectedContact, locationPreference: e.target.value })}
                      disabled
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-venueServiceType">Venue/Service Type</Label>
                    <Input
                      id="edit-venueServiceType"
                      value={selectedContact.venueServiceType || ''}
                      onChange={(e) => setSelectedContact({ ...selectedContact, venueServiceType: e.target.value })}
                      disabled
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-budgetRange">Budget Range</Label>
                    <Input
                      id="edit-budgetRange"
                      value={selectedContact.budgetRange || ''}
                      onChange={(e) => setSelectedContact({ ...selectedContact, budgetRange: e.target.value })}
                      disabled
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-contactTimePreference">Contact Time Preference</Label>
                    <Input
                      id="edit-contactTimePreference"
                      value={selectedContact.contactTimePreference || ''}
                      onChange={(e) => setSelectedContact({ ...selectedContact, contactTimePreference: e.target.value })}
                      disabled
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select
                      value={selectedContact.status}
                      onValueChange={(value: Contact['status']) =>
                        setSelectedContact({
                          ...selectedContact,
                          status: value,
                        })
                      }
                    >
                      <SelectTrigger id="edit-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-priority">Priority</Label>
                    <Select
                      value={selectedContact.priority}
                      onValueChange={(value: Contact['priority']) =>
                        setSelectedContact({
                          ...selectedContact,
                          priority: value,
                        })
                      }
                      disabled
                    >
                      <SelectTrigger id="edit-priority" disabled>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Contact Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this contact? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}