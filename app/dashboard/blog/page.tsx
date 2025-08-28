"use client"

import { useEffect, useState, ChangeEvent } from "react"
import { format } from "date-fns"
import { motion } from "framer-motion"
import {
  MoreHorizontal,
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  Image as ImageIcon,
} from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { 
  fetchBlogs, 
  createBlog, 
  updateBlog, 
  deleteBlog,
  selectBlogs,
  selectBlogLoading,
  selectBlogError
} from "@/lib/redux/features/blogSlice"
import { AppDispatch } from "@/lib/redux/store"
import Image from "next/image"

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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

// Define types to match the API and Redux Slice
interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  author: string;
  category: string | null;
  tags: string[];
  excerpt: string | null;
  status: 'draft' | 'published' | 'archived';
  image: string | null;
  createdOn: string;
  updatedOn: string;
}

interface BlogFormState {
  title: string;
  slug: string;
  content: string;
  author: string;
  category: string;
  tags: string; // comma-separated string for the input
  excerpt: string;
  status: 'draft' | 'published' | 'archived';
  image: string | null; // backend value only
  imageFile: File | null;
  imagePreviewUrl: string | null; // for preview only
  removeImage: boolean;
  existingImageUrl: string | null;
}

const initialFormState: BlogFormState = {
  title: "",
  slug: "",
  content: "",
  author: "",
  category: "",
  tags: "",
  excerpt: "",
  status: "draft",
  image: null,
  imageFile: null,
  imagePreviewUrl: null,
  removeImage: false,
  existingImageUrl: null,
}

export default function BlogsPage() {
  const dispatch = useDispatch<AppDispatch>()
  const blogs = useSelector(selectBlogs)
  const isLoading = useSelector(selectBlogLoading)
  const error = useSelector(selectBlogError) // You can use this to show a persistent error message if needed

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  const [newBlogForm, setNewBlogForm] = useState<BlogFormState>(initialFormState)
  const [editBlogForm, setEditBlogForm] = useState<BlogFormState | null>(null)
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchBlogs())
  }, [dispatch])

  const filteredBlogs = blogs.filter(blog =>
    blog?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog?.author?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
    (blog?.category && blog?.category?.toLowerCase().includes(searchQuery?.toLowerCase()))
  )

  const handleCreate = async () => {
    const formData = new FormData();
    formData.append("title", newBlogForm.title);
    formData.append("content", newBlogForm.content);
    formData.append("author", newBlogForm.author);
    formData.append("status", newBlogForm.status);
    
    // Optional fields - only append if they have values
    if (newBlogForm.slug.trim()) formData.append("slug", newBlogForm.slug);
    if (newBlogForm.category.trim()) formData.append("category", newBlogForm.category);
    if (newBlogForm.tags.trim()) formData.append("tags", newBlogForm.tags);
    if (newBlogForm.excerpt.trim()) formData.append("excerpt", newBlogForm.excerpt);
    if (newBlogForm.image) formData.append("image", newBlogForm.image);
    if (newBlogForm.imageFile) {
      formData.append("imageFile", newBlogForm.imageFile);
    }
    
    dispatch(createBlog(formData))
      .unwrap()
      .then(() => {
        setNewBlogForm(initialFormState);
        setIsCreateDialogOpen(false);
        toast.success("Blog created successfully!");
      })
      .catch((err) => {
        toast.error(err || "Failed to create blog");
      });
  }

  const openEditDialog = (blog: Blog) => {
    setSelectedBlogId(blog.id);
    setEditBlogForm({
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      author: blog.author,
      category: blog.category || "",
      tags: blog?.tags?.join(', '),
      excerpt: blog.excerpt || "",
      status: blog.status,
      image: blog.image,
      imageFile: null,
      imagePreviewUrl: null,
      removeImage: false,
      existingImageUrl: blog.image,
    });
    setIsEditDialogOpen(true);
  }

  const handleEdit = async () => {
    if (!editBlogForm || !selectedBlogId) return

    const formData = new FormData();
    formData.append("title", editBlogForm.title);
    formData.append("content", editBlogForm.content);
    formData.append("author", editBlogForm.author);
    formData.append("status", editBlogForm.status);
    
    // Optional fields - append even if empty to allow clearing
    formData.append("slug", editBlogForm.slug);
    formData.append("category", editBlogForm.category);
    formData.append("tags", editBlogForm.tags);
    formData.append("excerpt", editBlogForm.excerpt);
    if (editBlogForm.image) formData.append("image", editBlogForm.image);

    if (editBlogForm.imageFile) {
      formData.append("imageFile", editBlogForm.imageFile);
    }
    if (editBlogForm.removeImage) {
      formData.append("removeImage", "true");
    }

    dispatch(updateBlog({ id: selectedBlogId, data: formData }))
      .unwrap()
      .then(() => {
        setIsEditDialogOpen(false);
        setEditBlogForm(null);
        setSelectedBlogId(null);
        toast.success("Blog updated successfully!");
      })
      .catch((err) => {
        toast.error(err || "Failed to update blog");
      });
  }

  const handleDelete = async () => {
    if (!selectedBlogId) return

    try {
      await dispatch(deleteBlog(selectedBlogId)).unwrap()
      setIsDeleteDialogOpen(false)
      setSelectedBlogId(null)
      toast.success("Blog deleted successfully!")
    } catch (error) {
      toast.error("Failed to delete blog")
    }
  }

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    formState: BlogFormState,
    setFormState: React.Dispatch<React.SetStateAction<any>>
  ) => {
    const file = e.target.files?.[0] || null
    
    // Clean up previous object URL
    if (formState.imageFile && formState.imagePreviewUrl && formState.imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(formState.imagePreviewUrl)
    }

    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        e.target.value = '' // Reset input
        return
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        e.target.value = '' // Reset input
        return
      }

      const objectUrl = URL.createObjectURL(file)
      setFormState({
        ...formState,
        imageFile: file,
        imagePreviewUrl: objectUrl,
        removeImage: false, // Reset remove flag when new image is selected
      })
    } else {
      setFormState({
        ...formState,
        imageFile: null,
        imagePreviewUrl: null,
      })
    }
  }

  const renderFormFields = (
    formState: BlogFormState, 
    setFormState: React.Dispatch<React.SetStateAction<any>>
  ) => {
    return (
      <div className="grid gap-4 py-4 max-h-[50vh] sm:max-h-[60vh] md:max-h-[70vh] overflow-y-auto pr-4">
        {/* Title Field */}
        <div className="grid gap-2">
          <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
          <Input 
            id="title"
            value={formState.title}
            onChange={(e) => setFormState({ ...formState, title: e.target.value })}
            placeholder="Enter blog title"
          />
        </div>

        {/* Slug Field - Optional */}
        <div className="grid gap-2">
          <Label htmlFor="slug">Slug</Label>
          <Input 
            id="slug"
            value={formState.slug}
            onChange={(e) => setFormState({ ...formState, slug: e.target.value })}
            placeholder="enter-blog-slug (optional)"
          />
          <p className="text-sm text-muted-foreground">URL-friendly version of the title (auto-generated if empty)</p>
        </div>

        {/* Content Field */}
        <div className="grid gap-2">
          <Label htmlFor="content">Content <span className="text-red-500">*</span></Label>
          <Textarea 
            id="content"
            value={formState.content}
            onChange={(e) => setFormState({ ...formState, content: e.target.value })}
            rows={6}
            placeholder="Write your blog content here..."
          />
        </div>

        {/* Author Field */}
        <div className="grid gap-2">
          <Label htmlFor="author">Author <span className="text-red-500">*</span></Label>
          <Input 
            id="author"
            value={formState.author}
            onChange={(e) => setFormState({ ...formState, author: e.target.value })}
            placeholder="Author name"
          />
        </div>

        {/* Category and Status Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Input 
              id="category"
              value={formState.category}
              onChange={(e) => setFormState({ ...formState, category: e.target.value })}
              placeholder="Blog category"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
            <Select
              value={formState.status}
              onValueChange={(value: 'draft' | 'published' | 'archived') => 
                setFormState({ ...formState, status: value })
              }
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tags Field */}
        <div className="grid gap-2">
          <Label htmlFor="tags">Tags</Label>
          <Input 
            id="tags"
            value={formState.tags}
            onChange={(e) => setFormState({ ...formState, tags: e.target.value })}
            placeholder="Enter tags separated by commas"
          />
          <p className="text-sm text-muted-foreground">Separate tags with commas (e.g., travel, guide, tips)</p>
        </div>

        {/* Excerpt Field */}
        <div className="grid gap-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea 
            id="excerpt"
            value={formState.excerpt}
            onChange={(e) => setFormState({ ...formState, excerpt: e.target.value })}
            rows={3}
            placeholder="Brief summary of the blog post"
          />
        </div>

        {/* Image URL Field */}
        <div className="grid gap-2">
          <Label htmlFor="image">Image URL</Label>
          <Input 
            id="image"
            value={formState.image || ""}
            readOnly
            className="bg-muted text-muted-foreground cursor-pointer"
            //onclick copy url
            onClick={() => {
              if (formState.image) {
                navigator.clipboard.writeText(formState.image)
                toast.success("Image URL copied to clipboard!")
              }
            }}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Featured Image File Field */}
        <div className="grid gap-2">
          <Label>Featured Image</Label>
          {(formState.imagePreviewUrl || (formState.image && !formState.removeImage)) && (
            <div className="my-2 space-y-2">
              <p className="text-sm text-muted-foreground">
                {formState.imageFile ? 'New image preview:' : 'Current image:'}
              </p>
              <div
                className="relative w-full h-40"
                style={{
                  backgroundImage: `url('/placeholder.svg')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <Image
                  src={formState.imagePreviewUrl || formState.image || ''}
                  alt="Blog preview"
                  fill
                  className="object-cover rounded-md border"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.parentElement?.nextElementSibling?.classList.remove('hidden')
                  }}
                />
              </div>
              {!formState.imageFile && formState.image && (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="removeImage" 
                    checked={formState.removeImage}
                    onCheckedChange={(checked) => 
                      setFormState({ ...formState, removeImage: !!checked })
                    }
                  />
                  <Label htmlFor="removeImage" className="text-sm font-medium">
                    Remove this image on save
                  </Label>
                </div>
              )}
            </div>
          )}
          <Input 
            id="imageFile"
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e, formState, setFormState)}
            className="file:text-foreground"
          />
          {formState.imageFile && (
            <p className="text-sm text-muted-foreground mt-1">
              New image selected: {formState.imageFile.name}
            </p>
          )}
        </div>
      </div>
    );
  }

  useEffect(() => {
    return () => {
      if (newBlogForm.imageFile && newBlogForm.imagePreviewUrl) {
        URL.revokeObjectURL(newBlogForm.imagePreviewUrl)
      }
    }
  }, [newBlogForm.imageFile])

  useEffect(() => {
    return () => {
      if (editBlogForm?.imageFile && editBlogForm.imagePreviewUrl) {
        URL.revokeObjectURL(editBlogForm.imagePreviewUrl)
      }
    }
  }, [editBlogForm?.imageFile])

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
      <div className="flex justify-between items-center sm:flex-row flex-col gap-4">
        <h1 className="text-2xl font-bold">Blog Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Blog
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Create New Blog</DialogTitle>
              <DialogDescription>Fill in the details for your new blog post. Click create when you're done.</DialogDescription>
            </DialogHeader>
            {renderFormFields(newBlogForm, setNewBlogForm)}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={isLoading || !newBlogForm.title || !newBlogForm.content || !newBlogForm.author}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          placeholder="Search by title, author, category..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          className="pl-9" 
        />
      </div>

      <motion.div layout className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Excerpt</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && blogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto"/>
                </TableCell>
              </TableRow>
            ) : filteredBlogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">No blogs found</TableCell>
              </TableRow>
            ) : (
              filteredBlogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell>
                    <div
                      className="relative w-16 h-12 rounded overflow-hidden"
                      style={{
                        backgroundImage: `url('/placeholder.svg')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                    {blog.image ? (
                        <Image
                          src={blog.image}
                          alt={blog.title}
                          fill
                          className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-[250px] truncate" title={blog.title}>
                    {blog.title}
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate" title={blog.content}> {blog.content}</TableCell>
                  <TableCell>{blog.author}</TableCell>
                  <TableCell>{blog.category || "—"}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      blog.status === 'published' ? 'bg-green-100 text-green-800'
                      : blog.status === 'draft' ? 'bg-yellow-100 text-yellow-800'
                      : blog.status === 'archived' ? 'bg-gray-100 text-gray-800'
                      : 'bg-gray-100 text-gray-800'
                    }`}>
                      {blog.status && blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {blog.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {blog.excerpt || "—"}
                  </TableCell>
                  <TableCell>
                    {blog.createdOn ? format(new Date(blog.createdOn), "MMM d, yyyy") : "—"}
                  </TableCell>
                  <TableCell>
                    {blog.updatedOn ? format(new Date(blog.updatedOn), "MMM d, yyyy") : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4"/>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openEditDialog(blog)}>
                          <Pencil className="mr-2 h-4 w-4"/>
                          Edit
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600 focus:bg-red-50" 
                          onSelect={() => {
                            setSelectedBlogId(blog.id)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4"/>
                          Delete
                        </DropdownMenuItem> */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
            <DialogDescription>Make changes to your blog post. Click save when you're done.</DialogDescription>
          </DialogHeader>
          {editBlogForm && renderFormFields(editBlogForm, setEditBlogForm)}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Blog Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blog</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this blog? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}