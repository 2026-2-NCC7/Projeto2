import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

function ChevronLeftIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M12.5 15L7.5 10L12.5 5"
        stroke="#1F1F1F"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ToConfirmBox({ children }) {
  return (
    <View className="rounded-[8px] bg-[#FAFAF8] p-3.5">
      <Text className="font-sans text-[13px] leading-[20px] text-[#555555]">
        <Text className="font-inter-semibold text-ink">A confirmar: </Text>
        {children}
      </Text>
    </View>
  );
}

function SubItem({ title, description }) {
  return (
    <View className="gap-1">
      <Text className="font-inter-semibold text-[14px] leading-[21px] text-ink">{title}</Text>
      <Text className="font-sans text-[14px] leading-[22px] text-[#555555]">{description}</Text>
    </View>
  );
}

export function PrivacyPolicyScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Privacy");
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 28) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Navegação — h=64, pad 0/20 */}
        <View
          className="h-16 flex-row items-center justify-between px-5"
          style={{ marginTop: Math.max(insets.top, 44) }}
        >
          <Pressable
            accessibilityLabel="Voltar a Privacidade e dados"
            className="h-11 flex-row items-center gap-1.5"
            onPress={handleGoBack}
          >
            <ChevronLeftIcon />
            <Text className="font-inter-medium text-[14px] leading-[17px] text-ink">
              Privacidade e dados
            </Text>
          </Pressable>
          <Text className="font-brand text-[22px] leading-[26px] text-ink">Ach.ai</Text>
        </View>

        {/* Documento de privacidade — pad 8/20/32/20, gap 28 */}
        <View className="gap-7 px-5 pb-8 pt-2">
          {/* Apresentação da política — gap 20 */}
          <View className="gap-5">
            {/* Título e introdução — gap 10 */}
            <View className="gap-2.5">
              <Text className="font-inter-extrabold text-[32px] leading-[37px] text-ink">
                Política de privacidade
              </Text>
              <Text className="font-sans text-[14px] leading-[21px] text-[#555555]">
                Uma proposta para explicar o uso de dados no Ach.ai e as escolhas sobre sua privacidade.
              </Text>
            </View>

            {/* Aviso de minuta — r=12, fill #FFF4E8, pad 16, gap 8 */}
            <View className="gap-2 rounded-[12px] bg-[#FFF4E8] p-4">
              <Text className="font-inter-bold text-[12px] leading-[15px] text-[#8B3D00]">
                MINUTA PARA REVISÃO
              </Text>
              <Text className="font-sans text-[14px] leading-[21px] text-ink">
                Este texto não é uma política aprovada. O conteúdo propõe como descrever o uso de dados e precisa ser validado com as práticas reais e revisado antes da publicação.
              </Text>
              <Text className="font-sans text-[13px] leading-[20px] text-[#555555]">
                Os trechos “A confirmar” indicam informações que ainda precisam ser verificadas.
              </Text>
            </View>

            {/* Versão do documento */}
            <View className="flex-row items-center justify-between">
              <Text className="font-sans text-[12px] leading-[15px] text-[#555555]">
                Versão de revisão 01
              </Text>
              <Text className="font-sans text-[12px] leading-[15px] text-[#555555]">
                Vigência a definir
              </Text>
            </View>
          </View>

          {/* Conteúdo da minuta — gap 28 */}
          <View className="gap-7">
            {/* 1. Responsável e contato */}
            <View className="gap-3 border-t border-[#E8E8E0] pt-6">
              <Text className="font-inter-bold text-[18px] leading-[24px] text-ink">
                1. Responsável e contato
              </Text>
              <Text className="font-sans text-[14px] leading-[22px] text-[#555555]">
                Esta minuta se refere ao Ach.ai. A organização responsável pelo tratamento dos dados pessoais e o canal para dúvidas e solicitações devem ser identificados na versão final.
              </Text>
              <Text className="font-sans text-[14px] leading-[22px] text-[#555555]">
                O nome do app, sozinho, não identifica a pessoa jurídica responsável. Nenhum contato oficial foi informado para esta revisão.
              </Text>
              <ToConfirmBox>
                identificação de quem decide sobre o tratamento, dados institucionais e canal de privacidade; identificação e contato do encarregado, quando aplicável.
              </ToConfirmBox>
            </View>

            {/* 2. Dados e finalidades */}
            <View className="gap-3 border-t border-[#E8E8E0] pt-6">
              <Text className="font-inter-bold text-[18px] leading-[24px] text-ink">
                2. Dados e finalidades
              </Text>
              <Text className="font-sans text-[14px] leading-[22px] text-[#555555]">
                A proposta abaixo considera apenas os recursos apresentados na interface. Ela não comprova que esses tratamentos já acontecem nem autoriza usos além dos que forem validados.
              </Text>
              <SubItem
                title="Conta"
                description="Nome e e-mail aparecem no cadastro. A proposta é usá-los para identificar a conta, permitir o acesso e manter as informações pessoais atualizadas."
              />
              <SubItem
                title="Listas e buscas de compras"
                description="Itens, quantidades e termos de busca podem ser necessários para criar e salvar listas e encontrar produtos. O histórico mantido e sua relação com a conta precisam ser confirmados."
              />
              <SubItem
                title="Supermercados e rotas"
                description="Bairro ou endereço informado, supermercado escolhido e itens da lista podem apoiar a descoberta de lojas e a organização da rota de compras."
              />
              <SubItem
                title="QR Code"
                description="O código lido pela câmera pode identificar a loja e iniciar a experiência de rota. É preciso verificar quais informações do código são processadas."
              />
              <ToConfirmBox>
                dados efetivamente coletados, fontes, associação com a conta e finalidades de cada uso. Validar a necessidade e a base legal de cada tratamento antes de publicar.
              </ToConfirmBox>
            </View>

            {/* 3. Localização, câmera e permissões */}
            <View className="gap-3 border-t border-[#E8E8E0] pt-6">
              <Text className="font-inter-bold text-[18px] leading-[24px] text-ink">
                3. Localização, câmera e permissões
              </Text>
              <Text className="font-sans text-[14px] leading-[22px] text-[#555555]">
                <Text className="font-inter-semibold text-ink">Localização. </Text>
                A finalidade proposta é encontrar supermercados próximos. Como alternativa, a interface oferece busca por bairro ou endereço. Ativar a preferência no Ach.ai não substitui a permissão nos ajustes do celular.
              </Text>
              <Text className="font-sans text-[14px] leading-[22px] text-[#555555]">
                <Text className="font-inter-semibold text-ink">Câmera. </Text>
                O acesso proposto se limita à leitura de QR Code quando esse recurso for utilizado. A presença do scanner não permite concluir que imagens sejam enviadas ou armazenadas.
              </Text>
              <Text className="font-sans text-[14px] leading-[22px] text-[#555555]">
                As permissões podem ser negadas ou revogadas nos ajustes do celular. Sem elas, os recursos que dependem desse acesso podem ficar indisponíveis. Os efeitos exatos precisam ser validados.
              </Text>
              <ToConfirmBox>
                precisão e momento do acesso à localização; processamento no aparelho ou em servidores; envio ou retenção de coordenadas, imagens e conteúdo do QR Code.
              </ToConfirmBox>
            </View>

            {/* 4. Dados opcionais e suas escolhas */}
            <View className="gap-3 border-t border-[#E8E8E0] pt-6">
              <Text className="font-inter-bold text-[18px] leading-[24px] text-ink">
                4. Dados opcionais e suas escolhas
              </Text>
              <Text className="font-sans text-[14px] leading-[22px] text-[#555555]">
                O telefone aparece como opcional em Dados pessoais e pode ser deixado em branco. Sua finalidade deve ser esclarecida antes de qualquer uso.
              </Text>
              <Text className="font-sans text-[14px] leading-[22px] text-[#555555]">
                Em Privacidade e dados, a interface apresenta as opções “Usar minha localização” e “Compartilhar dados de uso”. A proposta desta última é apoiar melhorias no app; quais informações entram nessa análise ainda precisa ser definido.
              </Text>
              <Text className="font-sans text-[14px] leading-[22px] text-[#555555]">
                Essas escolhas podem ser revistas na tela de origem, que orienta salvar as alterações. Usos opcionais devem ser distinguidos dos dados necessários à conta e às listas. Ler esta política não representa consentimento para todos os tratamentos.
              </Text>
              <ToConfirmBox>
                finalidade do telefone, eventos de uso coletados, identificadores envolvidos e efeitos de recusar ou alterar cada escolha. Verificar como o salvamento é aplicado.
              </ToConfirmBox>
            </View>

            {/* 5. Compartilhamento e prestadores */}
            <View className="gap-3 border-t border-[#E8E8E0] pt-6">
              <Text className="font-inter-bold text-[18px] leading-[24px] text-ink">
                5. Compartilhamento e prestadores
              </Text>
              <Text className="font-sans text-[14px] leading-[22px] text-[#555555]">
                Caso prestadores sejam necessários para operar os recursos do Ach.ai, a versão final deverá explicar as categorias de destinatários, os dados envolvidos e as finalidades de cada compartilhamento.
              </Text>
              <Text className="font-sans text-[14px] leading-[22px] text-[#555555]">
                Propõe-se limitar o acesso ao necessário para cada serviço e definir responsabilidades de proteção dos dados. Eventuais divulgações exigidas por lei ou por autoridades devem ser avaliadas conforme as condições aplicáveis.
              </Text>
              <Text className="font-sans text-[14px] leading-[22px] text-[#555555]">
                Mostrar um supermercado no app não significa compartilhar suas listas com ele. Esta minuta também não pressupõe publicidade comportamental nem identifica fornecedores que não foram informados.
              </Text>
              <ToConfirmBox>
                se há compartilhamento, com quem, para quais tarefas e com quais limites. Verificar também onde os dados são tratados e se existe transferência internacional; esta minuta não presume que ela ocorra.
              </ToConfirmBox>
            </View>

            {/* 6. Retenção e segurança */}
            <View className="gap-3 border-t border-[#E8E8E0] pt-6">
              <Text className="font-inter-bold text-[18px] leading-[24px] text-ink">
                6. Retenção e segurança
              </Text>
              <Text className="font-sans text-[14px] leading-[22px] text-[#555555]">
                Propõe-se manter os dados pelo período necessário às finalidades informadas e às obrigações aplicáveis, com critérios de revisão, descarte ou outra destinação adequada. Os períodos reais ainda precisam ser definidos.
              </Text>
              <Text className="font-sans text-[14px] leading-[22px] text-[#555555]">
                A versão final deverá descrever as medidas adotadas para reduzir riscos de acesso indevido, perda ou uso inadequado, sem expor detalhes que comprometam a proteção. Nenhum sistema oferece segurança absoluta.
              </Text>
              <Text className="font-sans text-[14px] leading-[22px] text-[#555555]">
                A exclusão da conta pode exigir análise sobre dados que devam ser conservados. Não se presume eliminação imediata de todos os registros ou anonimato garantido.
              </Text>
              <ToConfirmBox>
                critérios e prazos por categoria, tratamento após exclusão da conta, cópias de segurança, medidas técnicas e organizacionais e procedimento para incidentes.
              </ToConfirmBox>
            </View>

            {/* 7. Seus direitos e solicitações */}
            <View className="gap-3 border-t border-[#E8E8E0] pt-6">
              <Text className="font-inter-bold text-[18px] leading-[24px] text-ink">
                7. Seus direitos e solicitações
              </Text>
              <Text className="font-sans text-[14px] leading-[22px] text-[#555555]">
                Você pode solicitar o exercício de direitos sobre seus dados pessoais, de acordo com as condições aplicáveis. Entre eles:
              </Text>

              <View className="gap-3.5">
                <SubItem
                  title="Acesso e cópia"
                  description="Pedir confirmação do tratamento e acesso aos dados pessoais vinculados à sua conta, inclusive por meio de uma solicitação de cópia."
                />
                <SubItem
                  title="Correção"
                  description="Solicitar a correção de informações incompletas, inexatas ou desatualizadas. A tela Dados pessoais permite revisar os campos de cadastro apresentados."
                />
                <SubItem
                  title="Solicitação de exclusão"
                  description="Pedir a exclusão da conta e dos dados associados, observadas as condições aplicáveis e eventuais hipóteses de conservação permitidas ou exigidas."
                />
              </View>

              <Text className="font-sans text-[14px] leading-[22px] text-[#555555]">
                Também podem ser cabíveis informações sobre compartilhamento e revisão de escolhas opcionais, inclusive revogação de consentimento quando essa for a base do uso.
              </Text>
              <Text className="font-sans text-[14px] leading-[22px] text-[#555555]">
                A tela Privacidade e dados apresenta opções para solicitar cópia dos dados e exclusão da conta. O procedimento proposto prevê confirmar a identidade e analisar o pedido, sem prometer prazo ou resultado automático. Eventuais limitações devem ser explicadas.
              </Text>
              <Text className="font-sans text-[14px] leading-[22px] text-[#555555]">
                Este documento é apenas informativo: sua leitura não envia solicitações nem exerce direitos em seu nome.
              </Text>
              <ToConfirmBox>
                canal oficial, fluxo de verificação de identidade, acompanhamento e critérios de resposta. Validar os procedimentos antes de disponibilizar a política.
              </ToConfirmBox>
            </View>

            {/* 8. Alterações desta política */}
            <View className="gap-3 border-t border-[#E8E8E0] pt-6">
              <Text className="font-inter-bold text-[18px] leading-[24px] text-ink">
                8. Alterações desta política
              </Text>
              <Text className="font-sans text-[14px] leading-[22px] text-[#555555]">
                A política poderá ser revisada para refletir mudanças nos recursos ou nas práticas de tratamento. A proposta é indicar a versão e a data de vigência e comunicar alterações relevantes de forma clara no app.
              </Text>
              <Text className="font-sans text-[14px] leading-[22px] text-[#555555]">
                Esta é a versão de revisão 01, sem vigência definida. Antes de publicar, é necessário concluir os pontos a confirmar, validar as práticas reais e realizar a revisão jurídica do texto. Não há aprovação ou conformidade jurídica validada nesta minuta.
              </Text>
              <ToConfirmBox>
                processo de aprovação, forma de comunicar mudanças, versão final e data de vigência.
              </ToConfirmBox>
            </View>
          </View>

          {/* Encerramento do documento — gap 24 */}
          <View className="gap-6">
            <View className="gap-1.5 border-t border-[#E8E8E0] pt-6">
              <Text className="font-inter-bold text-[13px] leading-[16px] text-ink">
                Minuta para revisão • Versão 01
              </Text>
              <Text className="font-sans text-[13px] leading-[20px] text-[#555555]">
                Documento em elaboração. A leitura não exige concordância nem altera suas escolhas de privacidade.
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              className="h-[54px] items-center justify-center rounded-[12px] border border-achai bg-white"
              onPress={handleGoBack}
            >
              <Text className="font-inter-semibold text-[14px] leading-[17px] text-achai">
                Voltar a Privacidade e dados
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
