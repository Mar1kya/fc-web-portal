import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/auth";

const f = createUploadthing();

const handleAuthAdmin = async () => {
  const session = await auth();
  if (!session?.user) throw new UploadThingError("Unauthorized");
  if (session.user.role !== "ADMIN")
    throw new UploadThingError("Forbidden: Admins only");
  return { userId: session.user.id };
};

export const ourFileRouter = {
  profileImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user) throw new UploadThingError("Unauthorized");
      return { userId: session.user.id || session.user.email };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  productImage: f({ image: { maxFileSize: "8MB", maxFileCount: 5 } })
    .middleware(handleAuthAdmin)
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  postImage: f({ image: { maxFileSize: "8MB", maxFileCount: 4 } })
    .middleware(handleAuthAdmin)
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  galleryImages: f({ image: { maxFileSize: "8MB", maxFileCount: 50 } })
    .middleware(handleAuthAdmin)
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  teamMemberImage: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .middleware(handleAuthAdmin)
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  teamLogo: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(handleAuthAdmin)
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  documentFile: f({ pdf: { maxFileSize: "16MB", maxFileCount: 1 } })
    .middleware(handleAuthAdmin)
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  videoFile: f({ video: { maxFileSize: "64MB", maxFileCount: 1 } })
    .middleware(handleAuthAdmin)
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
