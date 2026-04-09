import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Split, Users, Link2, UserPlus, X, Check, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Person {
  id: number;
  name: string;
  color: string;
}

interface BillSplitterProps {
  items: OrderItem[];
  totalAmount: number;
  restaurantName?: string;
}

const PERSON_COLORS = [
  "hsl(var(--primary))",
  "hsl(280, 70%, 55%)",
  "hsl(340, 70%, 55%)",
  "hsl(200, 70%, 50%)",
  "hsl(160, 60%, 45%)",
  "hsl(30, 80%, 55%)",
  "hsl(50, 80%, 50%)",
  "hsl(0, 70%, 55%)",
];

const BillSplitter = ({ items, totalAmount, restaurantName }: BillSplitterProps) => {
  const [splitCount, setSplitCount] = useState(2);
  const [people, setPeople] = useState<Person[]>([
    { id: 1, name: "Person 1", color: PERSON_COLORS[0] },
    { id: 2, name: "Person 2", color: PERSON_COLORS[1] },
  ]);
  const [itemAssignments, setItemAssignments] = useState<Record<string, number[]>>({});
  const [editingPersonId, setEditingPersonId] = useState<number | null>(null);

  const perPersonEqual = totalAmount / splitCount;

  const handleShareLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("split", String(splitCount));
    navigator.clipboard.writeText(url.toString());
    toast.success("Split link copied to clipboard!");
  };

  const handleShareWhatsApp = () => {
    const msg = `Hey! Your share of the bill at ${restaurantName || "the restaurant"} is £${perPersonEqual.toFixed(2)} 🍽️`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const addPerson = () => {
    const nextId = Math.max(...people.map((p) => p.id), 0) + 1;
    setPeople([...people, { id: nextId, name: `Person ${nextId}`, color: PERSON_COLORS[(nextId - 1) % PERSON_COLORS.length] }]);
  };

  const removePerson = (id: number) => {
    if (people.length <= 2) return;
    setPeople(people.filter((p) => p.id !== id));
    const updated = { ...itemAssignments };
    for (const key in updated) {
      updated[key] = updated[key].filter((pid) => pid !== id);
    }
    setItemAssignments(updated);
  };

  const renamePerson = (id: number, name: string) => {
    setPeople(people.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  const toggleAssignment = (itemId: string, personId: number) => {
    const current = itemAssignments[itemId] || [];
    const updated = current.includes(personId)
      ? current.filter((id) => id !== personId)
      : [...current, personId];
    setItemAssignments({ ...itemAssignments, [itemId]: updated });
  };

  const perPersonByItem = useMemo(() => {
    const totals: Record<number, number> = {};
    people.forEach((p) => (totals[p.id] = 0));

    items.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      const assigned = itemAssignments[item.id] || [];
      if (assigned.length === 0) return;
      const share = itemTotal / assigned.length;
      assigned.forEach((pid) => {
        if (totals[pid] !== undefined) totals[pid] += share;
      });
    });

    return totals;
  }, [items, itemAssignments, people]);

  const unassignedTotal = useMemo(() => {
    let assigned = 0;
    items.forEach((item) => {
      if ((itemAssignments[item.id] || []).length > 0) {
        assigned += item.price * item.quantity;
      }
    });
    return totalAmount - assigned;
  }, [items, itemAssignments, totalAmount]);

  const getInitials = (name: string) => {
    return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Split className="h-5 w-5 text-primary" />
        Split Bill
      </h2>

      <Tabs defaultValue="equal">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="equal">Split Equally</TabsTrigger>
          <TabsTrigger value="byItem">Split by Item</TabsTrigger>
        </TabsList>

        {/* Equal Split */}
        <TabsContent value="equal" className="space-y-3 mt-3">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <label className="text-sm font-medium whitespace-nowrap">
                  Split between
                </label>
                <Input
                  type="number"
                  min={2}
                  max={20}
                  value={splitCount}
                  onChange={(e) => {
                    const v = Math.max(2, Math.min(20, Number(e.target.value) || 2));
                    setSplitCount(v);
                  }}
                  className="w-20 h-10 text-center"
                />
                <span className="text-sm text-muted-foreground">people</span>
              </div>

              <div className="bg-primary/5 rounded-xl p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Each person pays</p>
                <p className="text-4xl font-extrabold text-primary tracking-tight">
                  £{perPersonEqual.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total £{totalAmount.toFixed(2)} ÷ {splitCount} people
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleShareLink}
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  Copy link
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                  onClick={handleShareWhatsApp}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* By Item Split */}
        <TabsContent value="byItem" className="space-y-3 mt-3">
          {/* People management */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">People</p>
                <Button variant="ghost" size="sm" onClick={addPerson} className="h-8">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {people.map((person) => (
                  <div key={person.id} className="flex items-center gap-1">
                    {editingPersonId === person.id ? (
                      <Input
                        autoFocus
                        className="h-8 w-28 text-xs"
                        value={person.name}
                        onChange={(e) => renamePerson(person.id, e.target.value)}
                        onBlur={() => setEditingPersonId(null)}
                        onKeyDown={(e) => e.key === "Enter" && setEditingPersonId(null)}
                      />
                    ) : (
                      <button
                        onClick={() => setEditingPersonId(person.id)}
                        className="flex items-center gap-1.5 py-1 px-2.5 rounded-full border border-border hover:border-primary/30 transition-colors"
                      >
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: person.color }}
                        >
                          {getInitials(person.name)}
                        </span>
                        <span className="text-xs font-medium">{person.name}</span>
                      </button>
                    )}
                    {people.length > 2 && (
                      <button
                        onClick={() => removePerson(person.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Item assignments */}
          <div className="space-y-2">
            {items.map((item) => {
              const assigned = itemAssignments[item.id] || [];
              return (
                <Card key={item.id}>
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-sm">
                          {item.quantity}x {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          £{(item.price * item.quantity).toFixed(2)}
                          {assigned.length > 1 &&
                            ` · £${(
                              (item.price * item.quantity) /
                              assigned.length
                            ).toFixed(2)} each`}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {people.map((person) => {
                        const isAssigned = assigned.includes(person.id);
                        return (
                          <button
                            key={person.id}
                            onClick={() => toggleAssignment(item.id, person.id)}
                            className="flex flex-col items-center gap-0.5 transition-all"
                          >
                            <span
                              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                isAssigned
                                  ? "text-white ring-2 ring-offset-1 ring-primary/50 scale-110"
                                  : "text-white/60 opacity-40 grayscale"
                              }`}
                              style={{ backgroundColor: person.color }}
                            >
                              {isAssigned ? <Check className="h-4 w-4" /> : getInitials(person.name)}
                            </span>
                            <span className={`text-[10px] ${isAssigned ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                              {person.name.split(" ")[0]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Summary */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-3">Split Summary</p>
              <div className="space-y-2">
                {people.map((person) => (
                  <div key={person.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                        style={{ backgroundColor: person.color }}
                      >
                        {getInitials(person.name)}
                      </span>
                      <span>{person.name}</span>
                    </div>
                    <span className="font-semibold">
                      £{(perPersonByItem[person.id] || 0).toFixed(2)}
                    </span>
                  </div>
                ))}
                {unassignedTotal > 0.01 && (
                  <div className="flex justify-between text-sm text-muted-foreground pt-2 border-t">
                    <span>Unassigned</span>
                    <span>£{unassignedTotal.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillSplitter;
