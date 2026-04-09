import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Split, Users, Link2, UserPlus, X, Check } from "lucide-react";
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
}

interface BillSplitterProps {
  items: OrderItem[];
  totalAmount: number;
}

const BillSplitter = ({ items, totalAmount }: BillSplitterProps) => {
  const [splitCount, setSplitCount] = useState(2);
  const [people, setPeople] = useState<Person[]>([
    { id: 1, name: "Person 1" },
    { id: 2, name: "Person 2" },
  ]);
  // Map: itemId -> personId[]
  const [itemAssignments, setItemAssignments] = useState<Record<string, number[]>>({});
  const [editingPersonId, setEditingPersonId] = useState<number | null>(null);

  const perPersonEqual = totalAmount / splitCount;

  const handleShareLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("split", String(splitCount));
    navigator.clipboard.writeText(url.toString());
    toast.success("Split link copied to clipboard!");
  };

  const addPerson = () => {
    const nextId = Math.max(...people.map((p) => p.id), 0) + 1;
    setPeople([...people, { id: nextId, name: `Person ${nextId}` }]);
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

              <div className="bg-primary/5 rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">Each person pays</p>
                <p className="text-3xl font-bold text-primary">
                  £{perPersonEqual.toFixed(2)}
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleShareLink}
              >
                <Link2 className="h-4 w-4 mr-2" />
                Copy share link
              </Button>
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
                      <Badge
                        variant="secondary"
                        className="cursor-pointer py-1.5 px-3"
                        onClick={() => setEditingPersonId(person.id)}
                      >
                        {person.name}
                      </Badge>
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
                    <div className="flex flex-wrap gap-1.5">
                      {people.map((person) => {
                        const isAssigned = assigned.includes(person.id);
                        return (
                          <button
                            key={person.id}
                            onClick={() => toggleAssignment(item.id, person.id)}
                            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-colors ${
                              isAssigned
                                ? "bg-primary/10 border-primary/30 text-primary"
                                : "border-border text-muted-foreground hover:border-primary/30"
                            }`}
                          >
                            {isAssigned && <Check className="h-3 w-3" />}
                            {person.name}
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
                  <div key={person.id} className="flex justify-between text-sm">
                    <span>{person.name}</span>
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
