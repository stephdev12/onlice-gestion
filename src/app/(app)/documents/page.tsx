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
  User,
  X,
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

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState("");
  const [docDesc, setDocDesc] = useState("");

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (!docTitle.trim()) {
      setDocTitle(file.name);
    }
    setUploadError(null);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile || !docTitle.trim()) return;
    setUploading(true);
    setUploadError(null);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });

      if (!result.ok) {
        throw new Error("Erreur lors de l'envoi du fichier");
      }

      const { storageId } = await result.json();

      await createDocument({
        titre: docTitle.trim(),
        description: docDesc.trim() || undefined,
        storageId,
        type: selectedFile.type || "application/octet-stream",
        size: selectedFile.size,
      });

      setIsUploadDrawerOpen(false);
      setSelectedFile(null);
      setDocTitle("");
      setDocDesc("");
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

  const filteredDocs = (documents || []).filter((doc: any) => {
    const term = search.toLowerCase();
    const titleMatch = (doc.titre || "").toLowerCase().includes(term);
    const descMatch = (doc.description || "").toLowerCase().includes(term);
    const authorMatch = (doc.auteur || "").toLowerCase().includes(term);
    return titleMatch || descMatch || authorMatch;
  });

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
            placeholder="Rechercher par titre, description, expéditeur..."
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
                          wordBreak: "break-word",
                          lineHeight: 1.35,
                        }}
                        title={doc.titre}
                      >
                        {doc.titre}
                      </div>

                      {doc.description && (
                        <div
                          style={{
                            fontSize: "12.5px",
                            color: "var(--slate)",
                            marginTop: "4px",
                            wordBreak: "break-word",
                            lineHeight: 1.4,
                          }}
                        >
                          {doc.description}
                        </div>
                      )}

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "12px",
                          color: "var(--slate)",
                          marginTop: "6px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            background: "var(--mist)",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            color: "var(--ink)",
                            fontWeight: 500,
                            fontSize: "11.5px",
                          }}
                        >
                          <User size={12} />
                          Expédié par {doc.auteur || "Utilisateur"}
                        </span>
                        <span>•</span>
                        <span>{formatBytes(doc.size)}</span>
                        <span>•</span>
                        <span>
                          {new Date(doc.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
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
                        title="Supprimer définitivement"
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
          if (!uploading) {
            setIsUploadDrawerOpen(false);
            setSelectedFile(null);
            setDocTitle("");
            setDocDesc("");
          }
        }}
        title="Ajouter un document"
        subtitle="Déposez un fichier, nommez-le et partagez-le avec l'équipe"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {!selectedFile ? (
            <FileUpload
              onFileReady={handleFileSelect}
              label="Glissez un fichier ou cliquez ici pour sélectionner"
              maxFileSize={20 * 1024 * 1024} // 20 MB max
            />
          ) : (
            <div
              style={{
                border: "1px solid var(--mist-line)",
                borderRadius: "var(--radius)",
                padding: "14px",
                background: "var(--mist)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                <div className="doc-icon" style={{ background: "var(--paper)" }}>
                  {getFileIcon(selectedFile.type)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "var(--ink)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {selectedFile.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--slate)", marginTop: "2px" }}>
                    {formatBytes(selectedFile.size)} • {selectedFile.type || "Fichier"}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="icon-btn"
                title="Changer de fichier"
                disabled={uploading}
              >
                <X size={18} />
              </button>
            </div>
          )}

          <TextInput
            label="Nom / Titre du document"
            placeholder="Ex: Rapport Stratégique Q3 2026.pdf"
            value={docTitle}
            onChange={setDocTitle}
            required
            disabled={uploading}
          />

          <TextInput
            label="Description courte (optionnel)"
            placeholder="Ex: Version signée et validée par l'équipe financière"
            value={docDesc}
            onChange={setDocDesc}
            disabled={uploading}
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

          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <Button
              variant="outline"
              onClick={() => {
                setIsUploadDrawerOpen(false);
                setSelectedFile(null);
                setDocTitle("");
                setDocDesc("");
              }}
              style={{ flex: 1 }}
              disabled={uploading}
            >
              Annuler
            </Button>
            <Button
              variant="accent"
              onClick={handleUploadSubmit}
              disabled={!selectedFile || !docTitle.trim() || uploading}
              style={{ flex: 2 }}
            >
              {uploading ? "Envoi en cours..." : "Publier le document"}
            </Button>
          </div>

          <div style={{ fontSize: "12px", color: "var(--slate)", lineHeight: 1.5, marginTop: "4px" }}>
            <p>
              Le document sera immédiatement classé et associé à votre nom en tant qu&apos;expéditeur.
            </p>
          </div>
        </div>
      </Drawer>
    </>
  );
}
