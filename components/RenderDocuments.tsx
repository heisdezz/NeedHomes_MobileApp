import { View, Text, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import tw from "@/lib/tw";

const TITLE_DOC_LABELS: Record<string, string> = {
  CERTIFICATE_OF_OCCUPANCY: "Certificate of Occupancy (C of O)",
  GOVERNORS_CONSENT: "Governor's Consent",
  GAZETTE: "Gazette",
  REGISTERED_DEED_OF_ASSIGNMENT: "Registered Deed of Assignment",
  DEED_OF_CONVEYANCE: "Deed of Conveyance",
  OTHERS: "Others",
};

function DocRow({ label, url }: { label: string; url: string }) {
  return (
    <View
      style={[
        tw`flex-row items-center justify-between gap-3 p-3 rounded-xl`,
        { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.inputBorder },
      ]}
    >
      <View style={tw`flex-row items-center gap-2 flex-1`}>
        <Ionicons name="document-text-outline" size={18} color="#3B82F6" />
        <Text
          numberOfLines={1}
          style={[tw`text-sm font-medium flex-1`, { color: Colors.textPrimary }]}
        >
          {label}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => Linking.openURL(url)}
        activeOpacity={0.7}
        style={tw`flex-row items-center gap-1`}
      >
        <Ionicons name="open-outline" size={14} color="#3B82F6" />
        <Text style={[tw`text-xs font-semibold`, { color: "#3B82F6" }]}>View</Text>
      </TouchableOpacity>
    </View>
  );
}

interface RenderDocumentsProps {
  documents?: { label: string; url: string | null | undefined }[];
  buildingPermitNumber?: string | null;
  propertyDocument?: string | null;
  propertyTitleDocuments?: { type: string; documentUrl: string }[] | null;
}

export function RenderDocuments({
  documents = [],
  buildingPermitNumber,
  propertyDocument,
  propertyTitleDocuments,
}: RenderDocumentsProps) {
  const simpleEntries = documents.filter((d) => !!d.url) as { label: string; url: string }[];
  const hasTitleDocs = propertyTitleDocuments && propertyTitleDocuments.length > 0;
  const hasAnything =
    simpleEntries.length > 0 || buildingPermitNumber || propertyDocument || hasTitleDocs;

  if (!hasAnything) {
    return (
      <Text style={[tw`text-sm`, { color: Colors.textMuted }]}>No documents available.</Text>
    );
  }

  return (
    <View style={tw`gap-3`}>
      {simpleEntries.map((doc) => (
        <DocRow key={doc.label} label={doc.label} url={doc.url} />
      ))}

      {buildingPermitNumber && (
        <View
          style={[
            tw`flex-row items-center gap-3 p-3 rounded-xl`,
            { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.inputBorder },
          ]}
        >
          <Ionicons name="document-outline" size={18} color={Colors.textMuted} />
          <View>
            <Text style={[tw`text-xs`, { color: Colors.textMuted }]}>Building Permit Number</Text>
            <Text style={[tw`text-sm font-medium`, { color: Colors.textPrimary }]}>
              {buildingPermitNumber}
            </Text>
          </View>
        </View>
      )}

      {hasTitleDocs && (
        <View style={tw`gap-2`}>
          <Text
            style={[tw`text-xs font-semibold uppercase tracking-wide`, { color: Colors.textMuted }]}
          >
            Title Documents
          </Text>
          {propertyTitleDocuments!.map((td, i) => (
            <DocRow
              key={i}
              label={TITLE_DOC_LABELS[td.type] ?? td.type}
              url={td.documentUrl}
            />
          ))}
        </View>
      )}
    </View>
  );
}
