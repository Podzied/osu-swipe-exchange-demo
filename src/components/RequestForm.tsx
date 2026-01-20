"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader } from "./ui/Card";
import { DINING_LOCATIONS, DIETARY_TAGS } from "@/lib/constants";

export function RequestForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [timeWindowStart, setTimeWindowStart] = useState("");
  const [timeWindowEnd, setTimeWindowEnd] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"PICKUP" | "DELIVERY">(
    "PICKUP"
  );
  const [deliveryBuilding, setDeliveryBuilding] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [selectedDietaryTags, setSelectedDietaryTags] = useState<string[]>([]);
  const [dietaryNotes, setDietaryNotes] = useState("");

  const toggleLocation = (id: string) => {
    setSelectedLocations((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  const toggleDietaryTag = (id: string) => {
    setSelectedDietaryTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locations: selectedLocations,
          timeWindowStart,
          timeWindowEnd,
          deliveryMethod,
          deliveryBuilding:
            deliveryMethod === "DELIVERY" ? deliveryBuilding : null,
          deliveryNotes: deliveryMethod === "DELIVERY" ? deliveryNotes : null,
          dietaryTags: selectedDietaryTags,
          dietaryNotes: dietaryNotes || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create request");
      }

      const request = await response.json();
      router.push(`/request/${request.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const canProceedStep1 = selectedLocations.length > 0;
  const canProceedStep2 = timeWindowStart && timeWindowEnd;
  const canProceedStep3 =
    deliveryMethod === "PICKUP" ||
    (deliveryMethod === "DELIVERY" && deliveryBuilding);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Request a Meal</h2>
          <div className="text-sm text-gray-500">Step {step} of 4</div>
        </div>
        <div className="flex gap-1 mt-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded ${s <= step ? "bg-primary-600" : "bg-gray-200"}`}
            />
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Location Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Select one or more dining locations where you can pick up
            </p>
            <div className="grid grid-cols-2 gap-3">
              {DINING_LOCATIONS.map((location) => (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => toggleLocation(location.id)}
                  className={`p-3 text-left rounded-lg border-2 transition-colors ${
                    selectedLocations.includes(location.id)
                      ? "border-primary-600 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="font-medium">{location.shortName}</p>
                  <p className="text-xs text-gray-500">{location.name}</p>
                </button>
              ))}
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={() => setStep(2)} disabled={!canProceedStep1}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Time Window */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-gray-600">
              When do you need your meal? Select a time window.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={timeWindowStart}
                  onChange={(e) => setTimeWindowStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={timeWindowEnd}
                  onChange={(e) => setTimeWindowEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={!canProceedStep2}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Delivery Method */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-gray-600">How would you like to receive your meal?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryMethod("PICKUP")}
                className={`p-4 text-left rounded-lg border-2 transition-colors ${
                  deliveryMethod === "PICKUP"
                    ? "border-primary-600 bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className="font-medium">Pickup</p>
                <p className="text-xs text-gray-500">
                  Meet at the dining location
                </p>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMethod("DELIVERY")}
                className={`p-4 text-left rounded-lg border-2 transition-colors ${
                  deliveryMethod === "DELIVERY"
                    ? "border-primary-600 bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className="font-medium">Delivery</p>
                <p className="text-xs text-gray-500">
                  Have it delivered to you
                </p>
              </button>
            </div>

            {deliveryMethod === "DELIVERY" && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Building / Location
                  </label>
                  <input
                    type="text"
                    value={deliveryBuilding}
                    onChange={(e) => setDeliveryBuilding(e.target.value)}
                    placeholder="e.g., Smith Hall, Room 204"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Notes (optional)
                  </label>
                  <textarea
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="Any special instructions..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={() => setStep(4)} disabled={!canProceedStep3}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Dietary Preferences */}
        {step === 4 && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Any dietary preferences or restrictions? (optional)
            </p>
            <div className="flex flex-wrap gap-2">
              {DIETARY_TAGS.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleDietaryTag(tag.id)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedDietaryTags.includes(tag.id)
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes (optional)
              </label>
              <textarea
                value={dietaryNotes}
                onChange={(e) => setDietaryNotes(e.target.value)}
                placeholder="Any other dietary notes or preferences..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Creating..." : "Submit Request"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
