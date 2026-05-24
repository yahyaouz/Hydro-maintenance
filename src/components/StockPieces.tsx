import * as React from "react";
import { 
  Package, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Search, 
  Plus, 
  AlertTriangle,
  History,
  ShoppingCart,
  Filter,
  MoreHorizontal,
  ChevronRight,
  TrendingDown,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import { useCollection } from "@/hooks/useCollection";
import { toast } from "sonner";

export function StockPieces() {
  const { activeSite, user, theme } = useAuthStore();
  const { data: piecesData, loading } = useCollection<any>('pieces');
  
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("TOUTES");
  const [pageSize, setPageSize] = React.useState(15);
  
  const canManageStock = ["ADMIN", "RESPONSABLE_MAINTENANCE"].includes(user?.role || "");
  
  const categories = React.useMemo(() => {
    const cats = new Set<string>();
    piecesData.forEach(p => {
      if (p.categorie) cats.add(p.categorie);
    });
    return Array.from(cats);
  }, [piecesData]);

  const filteredPieces = React.useMemo(() => {
    return piecesData.filter(p => {
      const matchesSite = activeSite === "TOUS" || p.siteId === activeSite;
      const matchesCategory = selectedCategory === "TOUTES" || p.categorie === selectedCategory;
      const term = search.toLowerCase().trim();
      const matchesSearch = !term || 
        (p.nom && p.nom.toLowerCase().includes(term)) || 
        (p.ref && p.ref.toLowerCase().includes(term)) || 
        (p.categorie && p.categorie.toLowerCase().includes(term));
      return matchesSite && matchesCategory && matchesSearch;
    });
  }, [piecesData, activeSite, selectedCategory, search]);

  const paginatedPieces = React.useMemo(() => {
    return filteredPieces.slice(0, pageSize);
  }, [filteredPieces, pageSize]);
  
  const totalValue = filteredPieces.reduce((acc, curr) => acc + (curr.stock * curr.prix), 0) / 1000000;
  const criticalItems = filteredPieces.filter(p => p.stock > 0 && p.stock <= p.min).length;
  const outOfStock = filteredPieces.filter(p => p.stock <= 0).length;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-[#f8fafc] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 min-h-screen select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight uppercase text-slate-950 dark:text-white flex items-center gap-2">
            <Package className="h-6 w-6 text-blue-600 dark:text-[#4A90D9]" /> PIÈCES ET STOCK RECHARGE
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Contrôle de l'inventaire en temps réel et approvisionnements</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex gap-3">
            <Button variant="outline" className="h-12 border-slate-200 dark:border-slate-800 dark:bg-[#131b2e] dark:hover:bg-slate-800 hover:bg-slate-100 font-bold text-xs uppercase tracking-widest no-double-tap-zoom px-5">
              <History className="mr-2 h-4 w-4" /> HISTORIQUE
            </Button>
            <Button 
              className={cn(
                "font-bold h-12 uppercase tracking-widest transition-all no-double-tap-zoom px-5",
                canManageStock 
                  ? "bg-blue-600 dark:bg-[#4A90D9] text-white dark:text-slate-900 shadow-lg hover:bg-blue-700 dark:hover:bg-[#3572b2]" 
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
              )}
              onClick={() => {
                if (!canManageStock) {
                  toast.error("Accès réservé Maintenance / Admin");
                  return;
                }
                toast.success("Entrée de stock initialisée avec succès.");
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> ENTRÉE STOCK
            </Button>
          </div>
          {!canManageStock && (
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Accès réservé Maintenance / Admin</span>
          )}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white dark:bg-[#131b2e] border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-blue-500 hover:shadow-md transition-all">
          <CardHeader className="py-4">
            <CardTitle className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Valeur Stock ({activeSite})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-950 dark:text-white font-mono">{totalValue.toFixed(1)} <span className="text-xs text-slate-400">M CFA</span></div>
            <p className="text-[10px] text-slate-500 dark:text-slate-450 font-medium italic mt-1">Actifs de rechange immobilisés</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#131b2e] border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-amber-500 hover:shadow-md transition-all">
          <CardHeader className="py-4">
            <CardTitle className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Stock Critique</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-500 font-mono">{criticalItems} <span className="text-xs">RÉFS</span></div>
            <p className="text-[10px] text-slate-500 dark:text-slate-450 font-medium italic mt-1">En-dessous du stock de sécurité</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#131b2e] border-slate-200 dark:border-slate-800 shadow-sm border-l-4 border-l-red-500 hover:shadow-md transition-all">
          <CardHeader className="py-4">
            <CardTitle className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Ruptures actives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-red-600 dark:text-red-500 font-mono">{outOfStock} <span className="text-xs">RÉFS</span></div>
            <p className="text-[10px] text-slate-500 dark:text-slate-455 font-medium italic mt-1 font-semibold">Impact direct sur MTTR</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#131b2e] border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="py-4">
            <CardTitle className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider font-mono">Mouvements (30j)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">452 Trans.</div>
            <p className="text-[10px] text-slate-500 dark:text-slate-450 font-medium italic mt-1">Flux validés par site d'extraction</p>
          </CardContent>
        </Card>
      </div>

      {/* TACTILE DYNAMIC FILTER BAR */}
      <div className="flex flex-col gap-4 bg-white dark:bg-[#131b2e] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPageSize(15);
              }}
              placeholder="Rechercher par référence, nom ou catégorie..." 
              className="pl-10 h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-blue-500 text-xs font-medium rounded-xl select-text" 
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearch("");
              setSelectedCategory("TOUTES");
              setPageSize(15);
            }}
            className="h-12 border-slate-200 dark:border-slate-800 text-xs font-extrabold uppercase tracking-wider px-5 rounded-xl no-double-tap-zoom"
          >
            Réinitialiser
          </Button>
        </div>

        {/* TACTILE CATEGORIES RAIL */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 font-mono">
          <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mr-2">Catégories :</span>
          <Button 
            variant={selectedCategory === "TOUTES" ? "secondary" : "ghost"} 
            onClick={() => { setSelectedCategory("TOUTES"); setPageSize(15); }}
            className={cn(
              "h-9 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg no-double-tap-zoom",
              selectedCategory === "TOUTES" 
                ? "bg-blue-600 dark:bg-[#4A90D9] text-white dark:text-slate-900" 
                : "text-slate-600 dark:text-slate-405 hover:bg-slate-50 dark:hover:bg-slate-950"
            )}
          >
            TOUTES ({piecesData.length})
          </Button>
          {categories.map(cat => {
            const count = piecesData.filter(p => p.categorie === cat).length;
            return (
              <Button 
                key={cat}
                variant={selectedCategory === cat ? "secondary" : "ghost"} 
                onClick={() => { setSelectedCategory(cat); setPageSize(15); }}
                className={cn(
                  "h-9 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg no-double-tap-zoom",
                  selectedCategory === cat 
                    ? "bg-blue-600 dark:bg-[#4A90D9] text-white dark:text-slate-900" 
                    : "text-slate-600 dark:text-slate-405 hover:bg-slate-50 dark:hover:bg-slate-950"
                )}
              >
                {cat} ({count})
              </Button>
            );
          })}
        </div>
      </div>

      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#131b2e] shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-[10px] font-black text-slate-505 dark:text-slate-400 uppercase tracking-widest">
          <div className="col-span-2">Désignation / Réf / Site</div>
          <div className="text-center">Catégorie</div>
          <div className="text-center">Stock / Seuil</div>
          <div className="text-center">Prix Unitaire</div>
          <div className="text-center">Santé Stock</div>
          <div className="text-right">Actions</div>
        </div>
        <ScrollArea className="h-[calc(100vh-420px)] scroll-inertia">
            {paginatedPieces.map((piece) => (
              <div key={piece.id} className="grid grid-cols-7 p-4 border-b border-slate-50 dark:border-slate-800/50 items-center hover:bg-slate-50/80 dark:hover:bg-slate-900/35 transition-colors group">
                 <div className="col-span-2 space-y-1">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{piece.nom}</p>
                    <div className="flex items-center gap-2">
                       <p className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">{piece.ref}</p>
                       <Badge variant="outline" className="text-[9px] py-0 px-1 font-bold bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-505 dark:text-slate-400">{piece.siteId}</Badge>
                    </div>
                 </div>
                 <div className="text-center">
                    <Badge variant="secondary" className="text-[9px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-305 border-none">{piece.categorie}</Badge>
                 </div>
                 <div className="text-center">
                    <div className="flex flex-col items-center">
                       <span className={cn(
                         "font-black text-lg italic tracking-tighter",
                         piece.stock <= 0 ? "text-red-600 underline" : 
                         piece.stock <= piece.min ? "text-amber-500 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                       )}>
                         {piece.stock}
                       </span>
                       <span className="text-[9px] font-bold text-slate-300 dark:text-slate-500 uppercase tracking-widest">MIN: {piece.min}</span>
                    </div>
                 </div>
                 <div className="text-center text-[11px] font-bold text-slate-605 dark:text-slate-400 font-mono">
                    {piece.prix.toLocaleString()} CFA
                 </div>
                 <div className="text-center">
                    <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full mx-auto overflow-hidden">
                       <div 
                         className={cn(
                            "h-full transition-all",
                            piece.stock <= 0 ? "bg-red-500 w-0" :
                            piece.stock <= piece.min ? "bg-amber-500 w-1/3" : "bg-emerald-500 w-full"
                         )}
                       />
                    </div>
                 </div>
                 <div className="text-right flex gap-1 justify-end">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors no-double-tap-zoom"
                      onClick={() => {
                        if (!canManageStock) {
                          toast.error("Accès réservé Maintenance / Admin");
                          return;
                        }
                        toast.success(`Sortie de stock enregistrée : ${piece.nom}`);
                      }}
                    >
                       <ArrowDownLeft className="h-5 w-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors no-double-tap-zoom"
                      onClick={() => {
                        if (!canManageStock) {
                          toast.error("Accès réservé Maintenance / Admin");
                          return;
                        }
                        toast.success(`Entrée de stock enregistrée : ${piece.nom}`);
                      }}
                    >
                       <ArrowUpRight className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 dark:text-slate-500">
                       <MoreHorizontal className="h-5 w-5" />
                    </Button>
                 </div>
              </div>
            ))}

            {/* PROGRESSIVE RENDERING / LOAD MORE TAB */}
            {filteredPieces.length > pageSize && (
              <div className="p-4 flex justify-center border-t border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10">
                <Button 
                  onClick={() => setPageSize(prev => prev + 15)}
                  variant="outline"
                  className="h-11 px-6 text-xs font-black uppercase tracking-wider border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 no-double-tap-zoom"
                >
                  Charger plus d'articles ({filteredPieces.length - pageSize} restants)
                </Button>
              </div>
            )}

            {filteredPieces.length === 0 && (
              <div className="p-20 text-center text-slate-450 dark:text-slate-500 italic text-sm">
                 Aucune pièce en stock répertoriée pour ce site.
              </div>
            )}
        </ScrollArea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-2">
               <Activity className="h-4 w-4 text-hydro" />
               <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-900">Analyse de Rotation</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                     <span className="text-[11px] font-bold text-slate-500 uppercase">Items à forte rotation (30j)</span>
                     <Badge className="bg-hydro">Filtres Gasoil</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                     <span className="text-[11px] font-bold text-slate-500 uppercase">Valeur stock dormant (&gt; 90j)</span>
                     <span className="text-sm font-black text-slate-700">12.4 M CFA</span>
                  </div>
               </div>
            </CardContent>
         </Card>
         <Card className="border-slate-200 shadow-sm border-dashed">
            <CardHeader className="flex flex-row items-center gap-2">
               <TrendingDown className="h-4 w-4 text-amber-500" />
               <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-900">Optimisation Achat</CardTitle>
            </CardHeader>
            <CardContent className="text-[11px] text-slate-500 italic leading-relaxed">
               Le système suggère un groupage de commande pour les filtres Sandvik entre le site **SMI** et **KOUDIA** pour bénéficier d'une remise volume de 12%. ⚠️ Rupture imminente sur les joints hydrauliques à Koudia.
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
