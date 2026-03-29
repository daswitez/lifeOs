import { Database, Link, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ResourcesPage() {
  const resources = [
    { title: "Supabase RLS Documentation", type: "link", storage: "external", url: "https://supabase.com/docs/guides/auth/row-level-security", date: "Today" },
    { title: "Building a Second Brain - Tiago Forte", type: "book", storage: "external", url: "Notion/Books", date: "Last Week" },
    { title: "AWS Cost Optimization Report", type: "pdf", storage: "internal", url: "storage/pdfs/aws-cost.pdf", date: "Oct 1" },
    { title: "Wireframes LifeOS.fig", type: "file", storage: "external", url: "Figma", date: "Sep 28" },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'link': return <Link className="w-4 h-4" />;
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'file': return <FileText className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  }

  return (
    <div className="min-h-full pb-24">
      <header className="sticky top-0 z-10 glass-header px-8 md:px-16 py-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Resources Vault</h1>
          <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mt-1">
            Media & References Engine
          </p>
        </div>
        <Button>+ Upload</Button>
      </header>

      <div className="px-8 md:px-16 mt-8 max-w-5xl">
        <div className="flex flex-col border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--card)] shadow-sm">
           
           {/* Table Header */}
           <div className="grid grid-cols-12 gap-4 p-4 border-b border-[var(--border)] bg-[var(--muted)]/50 text-xs font-semibold tracking-wider uppercase text-[var(--muted-foreground)]">
             <div className="col-span-6 md:col-span-5">Title</div>
             <div className="col-span-2 hidden md:block">Type</div>
             <div className="col-span-3 hidden md:block">Storage</div>
             <div className="col-span-6 md:col-span-2 text-right">Added</div>
           </div>

           {/* Table Body */}
           {resources.map((res, idx) => (
             <div 
               key={idx} 
               className={`grid grid-cols-12 gap-4 p-4 items-center hover:bg-[var(--accent-soft)] transition-colors cursor-pointer ${
                 idx !== resources.length - 1 ? "border-b border-[var(--border)]" : ""
               }`}
             >
               <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                 <div className="text-[var(--muted-foreground)]">{getIcon(res.type)}</div>
                 <span className="font-medium text-[var(--foreground)] truncate">{res.title}</span>
               </div>
               
               <div className="col-span-2 hidden md:flex">
                 <span className="text-[10px] font-mono uppercase bg-[var(--background)] border border-[var(--border)] px-2 py-0.5 rounded text-[var(--muted-foreground)]">
                   {res.type}
                 </span>
               </div>
               
               <div className="col-span-3 hidden md:flex items-center gap-2">
                 {res.storage === 'external' ? <ExternalLink className="w-3 h-3 text-[var(--muted-foreground)]" /> : <Database className="w-3 h-3 text-[var(--foreground)]" />}
                 <span className={`text-xs ${res.storage === 'internal' ? 'text-[var(--foreground)] font-medium' : 'text-[var(--muted-foreground)]'}`}>
                   {res.storage}
                 </span>
               </div>

               <div className="col-span-6 md:col-span-2 text-right text-xs font-mono text-[var(--muted-foreground)]">
                 {res.date}
               </div>

             </div>
           ))}

        </div>
      </div>
    </div>
  );
}
