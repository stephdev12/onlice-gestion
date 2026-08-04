"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";
import { TextInput } from "@/components/ui/TextInput";
import { Drawer } from "@/components/ui/Drawer";
import { Badge } from "@/components/ui/Badge";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  File,
  Download,
  Trash2,
  Plus,
  Search,
  ExternalLink,
} from "lucide-react";
import { staggerContainer, fadeInUp } from "@/lib/animations";

function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

function getFileIcon(type: string) {
  const lower = type.toLowerCase();
  if (lower.includes("pdf")) return <FileText size={22} style={{ color: "var(--orange)" }} />;
  if (lower.includes("sheet") || lower.includes("excel") || lower.includes("csv") || lower.includes("xls"))
    return <FileSpreadsheet size={22} style={{ color: "var(--teal)" }} />;
  if (lower.includes("image") || lower.includes("png") || lower.includes("jpg") || lower.includes("jpeg"))
    return <ImageIcon size={22} style={{ color: "#E056FD" }} />;
  return <File size={22} style={{ color: "var(--slate)" }} />;
}

export default function DocumentsPage() {
  const documents = useQuery(api.documents.list);
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const createDocument = useMutation(api.documents.create);
  const removeDocument = useMutation(api.documents.remove);

  const [search, setSearch] = useState("");
  const [isUploadDrawerOpen, setIsUploadDrawerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileReady = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error("Erreur lors de l'envoi du fichier");
      }

      const { storageId } = await result.json();

      await createDocument({
        titre: file.name,
        storageId,
        type: file.type || "application/octet-stream",
        size: file.size,
      });

      setIsUploadDrawerOpen(false);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Erreur inconnue");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Supprimer ce document définitivement ?")) return;
    try {
      await removeDocument({ id });
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression");
    }
  };

  const filteredDocs = (documents || []).filter((doc: any) =>
    doc.titre.toLowerCase().includes(search.toLowerCase())
  );

  const headerActions = (
    <Button variant="accent" onClick={() => setIsUploadDrawerOpen(true)}>
      <Plus size={16} /> Ajouter un document
    </Button>
  );

  return (
    <>
      <Header
        title="Documents Partagés"
        subtitle={`${(documents || []).length} document(s) dans l'espace d'entreprise`}
        actions={headerActions}
      />

      <div className="content-body">
        {/* Search & Filter Bar */}
        <div style={{ marginBottom: "20px", maxWidth: "420px" }}>
          <TextInput
            value={search}
            onChange={setSearch}
            placeholder="Rechercher par nom..."
            icon={<Search size={16} />}
            clearable
          />
        </div>

        {/* Documents list */}
        {documents === undefined ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "var(--slate)" }}>
            Chargement des documents...
          </div>
        ) : filteredDocs.length === 0 ? (
          <div
            style={{
              border: "1px dashed var(--mist-line)",
              borderRadius: "var(--radius)",
              padding: "40px 20px",
              textAlign: "center",
              color: "var(--slate)",
            }}
          >
            {search
              ? "Aucun document trouvé pour cette recherche."
              : "Aucun document partagé. Cliquez sur 'Ajouter un document' pour commencer."}
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="doc-grid"
          >
            <AnimatePresence mode="popLayout">
              {filteredDocs.map((doc: any) => (
                <motion.div
                  key={doc._id}
                  variants={fadeInUp}
                  layoutId={doc._id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <div
                    className="doc-card"
                    onClick={() => {
                      if (doc.url) window.open(doc.url, "_blank");
                    }}
                    style={{ cursor: doc.url ? "pointer" : "default" }}
                  >
                    {/* Icon container */}
                    <div className="doc-icon">{getFileIcon(doc.type)}</div>

                    {/* Main info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "var(--ink)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={doc.titre}
                      >
                        {doc.titre}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "11.5px",
                          color: "var(--slate)",
                          marginTop: "2px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span>{formatBytes(doc.size)}</span>
                        <span>•</span>
                        <span>Ajouté par {doc.auteur || "Utilisateur"}</span>
                        <span>•</span>
                        <span>
                          {new Date(doc.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {doc.url && (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="icon-btn"
                          title="Ouvrir le document"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(doc._id, e)}
                        className="icon-btn"
                        style={{ color: "var(--danger)" }}
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Mobile Floating Action Button (FAB) */}
      <button
        type="button"
        onClick={() => setIsUploadDrawerOpen(true)}
        className="fab"
        aria-label="Ajouter un document"
        title="Ajouter un document"
      >
        <Plus size={24} />
      </button>

      {/* Upload Drawer */}
      <Drawer
        isOpen={isUploadDrawerOpen}
        onClose={() => {
          if (!uploading) setIsUploadDrawerOpen(false);
        }}
        title="Ajouter un document"
        subtitle="Déposez un fichier à partager avec l'équipe"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <FileUpload
            onFileReady={handleFileReady}
            label="Glissez un fichier ou cliquez ici"
            maxFileSize={20 * 1024 * 1024} // 20 MB max
          />

          {uploadError && (
            <div
              style={{
                background: "var(--danger-tint)",
                color: "var(--danger)",
                padding: "10px 12px",
                borderRadius: "var(--radius-sm)",
                fontSize: "12.5px",
                fontWeight: 500,
              }}
            >
              {uploadError}
            </div>
          )}

          <div style={{ fontSize: "12px", color: "var(--slate)", lineHeight: 1.5 }}>
            <p>
              Les documents envoyés sont stockés de manière sécurisée et sont accessibles
              à l&apos;ensemble de l&apos;équipe.
            </p>
          </div>
        </div>
      </Drawer>
    </>
  );
}
